import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";
import { UserAnswerService } from "src/modules/toeic/services/user-answer.service";
import { UserService } from "src/modules/user/user.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { UserAnswer } from "src/entities/user-answer.entity";
import { OptionEnum } from "src/enum/option.enum";
import { parseOption } from "src/utils/option.util";
import { MMessageButtonClicked } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { Question } from "src/entities/question.entity";
import { ButtonBuilder } from "../builders/button.builder";
import { CommandType } from "../enums/commands.enum";

@Interaction(CommandType.BUTTON_USER_ANSWER)
@Injectable()
export class UserAnswerHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly questionService: ToeicQuestionService,
    private readonly userService: UserService,
    private readonly toeicPartService: ToeicPartService,
    private readonly toeicTestService: ToeicTestService,
    private readonly userAnswerService: UserAnswerService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const { questionId, answerOption, mezonId } = this.parseButtonId(this.event.button_id);

      if (!questionId || !answerOption || !mezonId) {
        await this.mezonMessage.reply({ t: "⚠️ Invalid button ID format." });
        return;
      }

      const questionIdNumber = Number(questionId);
      const chosenOption = parseOption(answerOption);

      if (!chosenOption) {
        await this.mezonMessage.reply({ t: "⚠️ Invalid option selected." });
        return;
      }

      const question = await this.questionService.findQuestionById(questionIdNumber);
      if (!question) {
        await this.mezonMessage.reply({ t: "⚠️ Question not found." });
        return;
      }

      const existingUser = await this.userService.findUserByMezonId(mezonId);
      if (!existingUser) {
        await this.mezonMessage.reply({ t: "⚠️ User not found." });
        return;
      }

      const isCorrect = question.correctOption === chosenOption;

      await this.saveUserAnswer(
        existingUser.id,
        chosenOption,
        isCorrect,
        question.part.id,
        question.test.id
      );

      await this.sendAnswerResponse(isCorrect, question, mezonId, chosenOption);

    } catch (error) {
      console.error("UserAnswerHandler Error:", error);

      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while fetching User Answer. Please try again later.",
      });
    }
  }

  private parseButtonId(buttonId: string): {
    questionId?: string;
    answerOption?: string;
    mezonId?: string;
  } {
    const parts = buttonId.split("_");

    const questionId = parts.find((p) => p.startsWith("q:"))?.split(":")[1];
    const answerOption = parts.find((p) => p.startsWith("a:"))?.split(":")[1];
    const mezonId = parts.find((p) => p.startsWith("id:"))?.split(":")[1];

    return { questionId, answerOption, mezonId };
  }

  private async saveUserAnswer(
    userId: number,
    chosenOption: OptionEnum,
    isCorrect: boolean,
    partId: number,
    testId: number
  ): Promise<void> {
    try {
      const existingUser = await this.userService.findUserById(userId);
      if (!existingUser) {
        console.warn(`⚠️ User with user id ${userId} not found`);
        return;
      }
      const existingPart = await this.toeicPartService.findPartById(partId);
      if (!existingPart) {
        console.warn(`⚠️ Part with part id ${partId} not found`);
        return;
      }
      const existingTest = await this.toeicTestService.findTestById(testId);
      if (!existingTest) {
        console.warn(`⚠️ User with test id ${testId} not found`);
        return;
      }

      const newUserAnswer = new UserAnswer();
      newUserAnswer.user = existingUser;
      newUserAnswer.chosenOption = chosenOption;
      newUserAnswer.isCorrect = isCorrect;
      newUserAnswer.toeicPart = existingPart;
      newUserAnswer.toeicTest = existingTest;

      await this.userAnswerService.recordAnswer(newUserAnswer);


    } catch (error) {
      console.error("❌ Failed to save user answer:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }

  private async sendAnswerResponse(
    isCorrect: boolean,
    question: Question,
    mezonId: string,
    chosenOption: OptionEnum
  ): Promise<void> {
    try {
      const resultText = isCorrect ? `✅ Correct! You chose ${chosenOption}.` : `❌ Wrong answer: You chose ${chosenOption}.`;
      const explanationText = question.explanation
        ? `\n📘 Explanation: \n ${question.explanation}`
        : "\n\ℹ️ No explanation available for this question.";
      const questionContent =
        question.passage?.content?.length > 0
          ? `${question.passage.content}\n\n**Question:** ${question.questionText}`
          : question.questionText;

      const buttons = new ButtonBuilder()
        .setId(`next-question_id:${mezonId}`)
        .setLabel("Next Question")
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build();

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#9fc117",
          title: `Question ${question.questionNumber}`,
          description: (() => {
            const lines: string[] = [];

            if (questionContent.length > 0) {
              lines.push(questionContent);
            }

            if (resultText) lines.push(resultText);
            if (explanationText) lines.push(explanationText);

            return lines.join("\n\n");
          })(),
          footer: `✅ Correct Option: ${question.correctOption}`,
          imageUrl: question.imageUrl || undefined,
          audioUrl: question.audioUrl || undefined,
        })
        .setText(`Start Test ${question.test?.id ?? "?"}, Part ${question.part?.id ?? "?"}`)
        .addButtonsRow([buttons])
        .build();

      await this.mezonMessage.update(
        messagePayload,
        undefined,
        messagePayload.attachments
      )
    } catch (error) {
      console.error("❌ Error sending answer response:", error);
    }
  }
}
