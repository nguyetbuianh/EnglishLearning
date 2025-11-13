import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable, Scope } from "@nestjs/common";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { UserAnswerService } from "../../toeic/services/user-answer.service";
import { UserService } from "../../user/user.service";
import { ToeicQuestionService } from "../../toeic/services/toeic-question.service";
import { ToeicPartService } from "../../toeic/services/toeic-part.service";
import { ToeicTestService } from "../../toeic/services/toeic-test.service";
import { UserAnswer } from "../../../entities/user-answer.entity";
import { OptionEnum } from "../../../enum/option.enum";
import { parseOption } from "../../../utils/option.util";
import { Question } from "../../../entities/question.entity";
import { CommandType } from "../enums/commands.enum";
import { DailyAnswerService } from "../../daily/services/daily-answer.service";
import { QuestionOptionService } from "../../toeic/services/question-option.service";
import { UserStatService } from "../../daily/services/user-stat.service";
import { sendAchievementBadgeReply } from "../utils/reply-message.util";
import { QuestionOption } from "../../../entities/question-option.entity";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";

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
@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_USER_ANSWER)
export class UserAnswerHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly questionService: ToeicQuestionService,
    private readonly userService: UserService,
    private readonly toeicPartService: ToeicPartService,
    private readonly toeicTestService: ToeicTestService,
    private readonly userAnswerService: UserAnswerService,
    private readonly dailyAnswerService: DailyAnswerService,
    private readonly userStatService: UserStatService,
    private readonly questionOptionService: QuestionOptionService
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
    await this.sendAnswerDailyResponse(question, isCorrect, chosenOption);

    const newBadges = await this.userStatService.updateUserStats(user.id, isCorrect);
    if (newBadges && newBadges.length > 0) {
      await sendAchievementBadgeReply(newBadges, this.mezonMessage);
    }
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
    const existingUser = await this.userService.getUserInCache(mezonId);
    if (!chosenOption || !question || !existingUser) {
      await this.mezonMessage.reply({ t: "⚠️ Missing data." });
      return;
    }
    const isCorrect = question.correctOption === chosenOption;

    await this.saveUserAnswer({
      userId: existingUser.id,
      chosenOption: chosenOption,
      isCorrect: isCorrect,
      partId: question.partId,
      testId: question.testId,
      questionId: question.id
    });

    const newBadges = await this.userStatService.updateUserStats(existingUser.id, isCorrect);

    if (newBadges && newBadges.length > 0) {
      await Promise.all([
        sendAchievementBadgeReply(newBadges, this.mezonMessage),
        this.sendAnswerTestResponse(isCorrect, question, mezonId, chosenOption),
      ]);
    } else {
      await this.sendAnswerTestResponse(isCorrect, question, mezonId, chosenOption);
    }
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
      const [existingUser, existingPart, existingTest, existingQuestion] = await Promise.all([
        this.userService.findUserById(userId),
        this.toeicPartService.findPartById(partId),
        this.toeicTestService.findTestById(testId),
        this.questionService.findQuestionById(questionId),
      ]);

      if (!existingUser || !existingPart || !existingTest || !existingQuestion) {
        console.warn(
          `⚠️ Missing required data when saving user answer:
          user=${!!existingUser}, part=${!!existingPart}, test=${!!existingTest}, question=${!!existingQuestion}`
        );
      }
      const newUserAnswer = new UserAnswer();
      newUserAnswer.user = existingUser!;
      newUserAnswer.chosenOption = chosenOption;
      newUserAnswer.isCorrect = isCorrect;
      newUserAnswer.toeicPart = existingPart!;
      newUserAnswer.toeicTest = existingTest!;
      newUserAnswer.question = existingQuestion!;

      await this.userAnswerService.recordAnswer(newUserAnswer);
    } catch (error) {
      console.error("❌ Failed to save user answer:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }

  private async buildAnswerMessage(answerMessageParams: AnswerMessageParams) {
    const { question, isCorrect, chosenOption, includeButtons, mezonId } = answerMessageParams;

    const correctOption = await this.questionOptionService.getOption(question.id, question.correctOption);
    let wrongOption: QuestionOption | null = null;
    if (!isCorrect) {
      wrongOption = await this.questionOptionService.getOption(question.id, chosenOption);
    }
    if (!correctOption && !wrongOption) {
      return;
    }

    const resultText = isCorrect
      ? `✅ Correct! You chose ${chosenOption}. ${correctOption!.optionText}`
      : `❌ Wrong answer: You chose ${chosenOption}. ${wrongOption!.optionText}
         ✅ Correct Option: ${question.correctOption}. ${correctOption!.optionText}`;

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
        footer: `English Learning Bot`,
        imageUrl: question.imageUrl || undefined,
        audioUrl: question.audioUrl || undefined,
      })
      .setText(`Start Test ${question.testId}, Part ${question.partId}`);

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
      const messagePayload = await this.buildAnswerMessage({
        question: question,
        isCorrect: isCorrect,
        chosenOption: chosenOption,
        includeButtons: true,
        mezonId: mezonId
      });

      if (!messagePayload) return;

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
      const messagePayload = await this.buildAnswerMessage({
        question: question,
        isCorrect: isCorrect,
        chosenOption: chosenOption,
        includeButtons: false
      });

      if (!messagePayload) return;

      await this.mezonMessage.update(messagePayload, undefined, messagePayload.attachments);
    } catch (error) {
      console.error("❌ Error sending daily answer response:", error);
    }
  }
}
