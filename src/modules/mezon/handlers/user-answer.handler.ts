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
import { DailyAnswerService } from "src/modules/daily/services/daily-answer.service";
import { UserStatService } from "src/modules/daily/services/user-stat.service";

interface ParsedButtonId {
  type?: string;
  questionId?: string;
  answerOption?: string;
  mezonId?: string;
}

interface SaveUserAnswerParams {
  userId: number;
  chosenOption: OptionEnum;
  isCorrect: boolean;
  partId: number;
  testId: number;
  questionId: number;
}

interface AnswerMessageParams {
  question: Question,
  isCorrect: boolean,
  chosenOption: OptionEnum,
  includeButtons: boolean,
  mezonId?: string
}

@Interaction(CommandType.BUTTON_USER_ANSWER)
@Injectable()
export class UserAnswerHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly questionService: ToeicQuestionService,
    private readonly userService: UserService,
    private readonly toeicPartService: ToeicPartService,
    private readonly toeicTestService: ToeicTestService,
    private readonly userAnswerService: UserAnswerService,
    private readonly dailyAnswerService: DailyAnswerService,
    private readonly userStatService: UserStatService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const { type } = this.parseButtonId();
      switch (type) {
        case "test":
          await this.handleTestAnswer();
          break;
        case "daily":
          await this.handleDailyAnswer();
          break;
        default:
          await this.mezonMessage.reply({ t: "⚠️ Unknown answer type." });
      }
    } catch (error) {
      console.error("UserAnswerHandler Error:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while fetching User Answer. Please try again later.",
      });
    }
  }

  private async handleDailyAnswer(): Promise<void> {
    const { questionId, answerOption } = this.parseButtonId();

    if (!questionId || !answerOption) {
      await this.mezonMessage.reply({ t: "⚠️ Invalid daily answer format." });
      return;
    }

    const mezonId = this.event.user_id;
    const questionIdNumber = Number(questionId);
    const chosenOption = parseOption(answerOption);
    const question = await this.questionService.findQuestionById(questionIdNumber);
    const user = await this.userService.findUserByMezonId(mezonId);

    if (!question || !user || !chosenOption) {
      await this.mezonMessage.reply({ t: "⚠️ Missing question or user data." });
      return;
    }

    const isCorrect = question.correctOption === chosenOption;

    await this.dailyAnswerService.saveDailyAnswer({
      user,
      question,
      chosenOption,
      isCorrect,
    });

    const newBadges = await this.userStatService.updateUserStats(user.id, isCorrect);
    if (newBadges.length > 0) {
      for (const badge of newBadges) {
        const embed = new MessageBuilder()
          .createEmbed({
            color: "#FFD700",
            title: "🏅 Congratulations!",
            description: `You’ve just unlocked a new achievement: ${badge} 🎉`,
            imageUrl: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjltOTc4MTVyb3ZicnZ0eG1yd2c5dmJ1anVlZDh1bXpqZmVjanhrbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hsmUlGtBlroCoU9esb/giphy.gif",
            footer: "Keep it up and collect them all!",
            timestamp: true,
          })
          .build();

        await this.mezonMessage.reply(embed);
      }
    }

    await this.sendAnswerDailyResponse(question, isCorrect, chosenOption);
  }

  private async handleTestAnswer(): Promise<void> {
    const { questionId, answerOption, mezonId } = this.parseButtonId();
    if (!questionId || !answerOption || !mezonId) {
      await this.mezonMessage.reply({ t: "⚠️ Invalid button ID format." });
      return;
    }

    const questionIdNumber = Number(questionId);
    const chosenOption = parseOption(answerOption);
    const question = await this.questionService.findQuestionById(questionIdNumber);
    const existingUser = await this.userService.findUserByMezonId(mezonId);
    if (!chosenOption || !question || !existingUser) {
      await this.mezonMessage.reply({ t: "⚠️ Missing data." });
      return;
    }
    const isCorrect = question.correctOption === chosenOption;

    await this.saveUserAnswer({
      userId: existingUser.id,
      chosenOption: chosenOption,
      isCorrect: isCorrect,
      partId: question.part.id,
      testId: question.test.id,
      questionId: question.id
    });

    await this.sendAnswerTestResponse(isCorrect, question, mezonId, chosenOption);
  }

  private parseButtonId(): ParsedButtonId {
    const buttonId = this.event.button_id;
    const parts = buttonId.split("_");

    const type = parts.find((t) => t.startsWith("t:"))?.split(":")[1].trim();
    const questionId = parts.find((p) => p.startsWith("q:"))?.split(":")[1].trim();
    const answerOption = parts.find((p) => p.startsWith("a:"))?.split(":")[1].trim();
    const mezonId = parts.find((p) => p.startsWith("id:"))?.split(":")[1].trim();

    return {
      type: type,
      questionId: questionId,
      answerOption: answerOption,
      mezonId: mezonId
    };
  }

  private async saveUserAnswer(
    saveUserAnswerParams: SaveUserAnswerParams
  ): Promise<void> {
    try {
      const { userId, chosenOption, isCorrect, partId, testId, questionId } = saveUserAnswerParams;
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
        return;
      }

      const existingQuestion = await this.questionService.findQuestionById(questionId);
      if (!existingQuestion) {
        return;
      }

      const newUserAnswer = new UserAnswer();
      newUserAnswer.user = existingUser;
      newUserAnswer.chosenOption = chosenOption;
      newUserAnswer.isCorrect = isCorrect;
      newUserAnswer.toeicPart = existingPart;
      newUserAnswer.toeicTest = existingTest;
      newUserAnswer.question = existingQuestion;

      await this.userAnswerService.recordAnswer(newUserAnswer);
    } catch (error) {
      console.error("❌ Failed to save user answer:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }

  private buildAnswerMessage(answerMessageParams: AnswerMessageParams) {
    const { question, isCorrect, chosenOption, includeButtons, mezonId } = answerMessageParams;
    const resultText = isCorrect
      ? `✅ Correct! You chose ${chosenOption}.`
      : `❌ Wrong answer: You chose ${chosenOption}.`;

    const explanationText = question.explanation
      ? `\n📘 Explanation:\n${question.explanation}`
      : "\nℹ️ No explanation available for this question.";

    const questionContent =
      question.passage?.content?.length > 0
        ? `${question.passage.content}\n\n**Question:** ${question.questionText}`
        : question.questionText;

    const messageBuilder = new MessageBuilder()
      .createEmbed({
        color: "#9fc117",
        title: `Question ${question.questionNumber}`,
        description: [questionContent, resultText, explanationText].filter(Boolean).join("\n\n"),
        footer: `✅ Correct Option: ${question.correctOption}`,
        imageUrl: question.imageUrl || undefined,
        audioUrl: question.audioUrl || undefined,
      })
      .setText(`Start Test ${question.test?.id ?? "?"}, Part ${question.part?.id ?? "?"}`);

    if (includeButtons && mezonId) {
      const nextQuestionButton = new ButtonBuilder()
        .setId(`next-question_id:${mezonId}`)
        .setLabel("Next Question")
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonId}`)
        .setLabel("Cancel Test")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      messageBuilder.addButtonsRow([nextQuestionButton, cancelButton]);
    }

    return messageBuilder.build();
  }

  private async sendAnswerTestResponse(
    isCorrect: boolean,
    question: Question,
    mezonId: string,
    chosenOption: OptionEnum
  ): Promise<void> {
    try {
      const messagePayload = this.buildAnswerMessage({
        question: question,
        isCorrect: isCorrect,
        chosenOption: chosenOption,
        includeButtons: true,
        mezonId: mezonId
      });

      await this.mezonMessage.update(messagePayload, undefined, messagePayload.attachments);
    } catch (error) {
      console.error("❌ Error sending test answer response:", error);
    }
  }

  private async sendAnswerDailyResponse(
    question: Question,
    isCorrect: boolean,
    chosenOption: OptionEnum
  ): Promise<void> {
    try {
      const messagePayload = this.buildAnswerMessage({
        question: question,
        isCorrect: isCorrect,
        chosenOption: chosenOption,
        includeButtons: false
      });

      await this.mezonMessage.update(messagePayload, undefined, messagePayload.attachments);
    } catch (error) {
      console.error("❌ Error sending daily answer response:", error);
    }
  }
}
