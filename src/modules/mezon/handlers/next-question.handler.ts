import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { PassageService } from "src/modules/toeic/services/passage.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { Question } from "src/entities/question.entity";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { replyQuestionMessage, sendAchievementBadgeReply, showAnswerReviewMessage } from "../utils/reply-message.util";
import { updateSession } from "../utils/update-session.util";
import { UserService } from "src/modules/user/user.service";
import { UserAnswerService } from "src/modules/toeic/services/user-answer.service";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { Passage } from "src/entities/passage.entity";
import { UserStatService } from "src/modules/daily/services/user-stat.service";

interface PartWithPassageParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  currentQuestionNumber: number;
  currentPassageNumber?: number;
  userId?: number;
}

interface NormalPartParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  currentQuestionNumber: number;
  userId?: number;
}

interface NextQuestionParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  question: Question;
  passage?: Passage;
  mezonMessage: Message;
}

interface FinishPartParams {
  mezonUserId?: string;
  testId: number;
  partId: number;
  userId: number;
  mezonMessage: Message;
}

@Injectable()
@Interaction(CommandType.BUTTON_NEXT_QUESTION)
export class NextQuestionHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly passageService: PassageService,
    private readonly userProgressService: UserProgressService,
    private readonly userService: UserService,
    private readonly userAnswerService: UserAnswerService,
    private readonly userStatService: UserStatService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const session = ToeicSessionStore.get(mezonUserId);
      if (!session?.testId || !session?.partId) {
        return;
      }

      const { testId, partId } = session;
      const existingProgress = await this.userProgressService.getProgress(testId, partId, mezonUserId);
      if (!existingProgress) {
        return;
      }

      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) {
        return;
      }

      if (partId === 6 || partId === 7) {
        await this.handlePartWithPassage({
          mezonUserId: mezonUserId,
          testId: testId,
          partId: partId,
          currentQuestionNumber: existingProgress.currentQuestionNumber,
          currentPassageNumber: existingProgress.currentPassageNumber,
          userId: user.id,
        });
      } else {
        await this.handleNormalPart({
          mezonUserId: mezonUserId,
          testId: testId,
          partId: partId,
          currentQuestionNumber: existingProgress.currentQuestionNumber,
          userId: user.id,
        });
      }
    } catch (error) {
      console.error("Error in NextQuestionHandler:", error);
      await this.mezonMessage.reply({
        t: '😢 Oops! Something went wrong. Please try again later!'
      })
    }
  }

  private async handlePartWithPassage(partWithPassageParams: PartWithPassageParams) {
    const {
      mezonUserId,
      testId,
      partId,
      currentQuestionNumber,
      currentPassageNumber,
      userId
    } = partWithPassageParams;

    const nextQuestionNumber = currentQuestionNumber + 1;
    let question = await this.toeicQuestionService.getQuestionWithPassage(
      testId,
      partId,
      nextQuestionNumber,
      currentPassageNumber
    );

    if (!question) {
      const nextPassageNumber = currentPassageNumber! + 1;
      const nextPassage = await this.passageService.getPassageDetail(
        testId,
        partId,
        nextPassageNumber
      );
      if (!nextPassage) {
        await this.userProgressService.updateProgress({
          userMezonId: mezonUserId,
          testId,
          partId,
          isCompleted: true,
        });

        await this.finishPartAndReward({
          mezonUserId: mezonUserId,
          testId: testId,
          partId: partId,
          userId: userId!,
          mezonMessage: this.mezonMessage
        });

        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestionByPassage(nextPassage.id);
      if (!firstQuestion) {
        await this.finishPartAndReward({
          mezonUserId: mezonUserId,
          testId: testId,
          partId: partId,
          userId: userId!,
          mezonMessage: this.mezonMessage
        });

        return;
      }

      await this.goToNextQuestion({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        question: firstQuestion,
        passage: nextPassage,
        mezonMessage: this.mezonMessage,
      });
      return;
    }

    await this.goToNextQuestion({
      mezonUserId: mezonUserId,
      testId: testId,
      partId: partId,
      question: question,
      passage: question.passage,
      mezonMessage: this.mezonMessage,
    });
  }

  private async handleNormalPart(normalPartParams: NormalPartParams) {
    const {
      mezonUserId,
      testId,
      partId,
      currentQuestionNumber,
      userId
    } = normalPartParams;

    const nextQuestionNumber = currentQuestionNumber + 1;
    const question = await this.toeicQuestionService.getQuestion(testId, partId, nextQuestionNumber);
    if (!question) {
      await this.userProgressService.updateProgress({
        userMezonId: mezonUserId,
        testId,
        partId,
        isCompleted: true,
      });

      await this.finishPartAndReward({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        userId: userId!,
        mezonMessage: this.mezonMessage
      });

      return;
    }

    await this.goToNextQuestion({
      mezonUserId: mezonUserId,
      testId: testId,
      partId: partId,
      question: question,
      mezonMessage: this.mezonMessage,
    });
  }

  private async goToNextQuestion(nextQuestionParams: NextQuestionParams) {
    const { mezonUserId, testId, partId, question, passage, mezonMessage } = nextQuestionParams;
    await this.userProgressService.updateProgress({
      userMezonId: mezonUserId,
      testId,
      partId,
      currentQuestionNumber: question.questionNumber,
      currentPassageNumber: question.passage?.passageNumber,
    });
    await updateSession(mezonUserId, question, this.mezonMessage.id);
    await replyQuestionMessage({ question, partId, testId, passage, mezonUserId, mezonMessage });
  }

  private async finishPartAndReward(finishPartParams: FinishPartParams) {
    const { mezonUserId, testId, partId, userId, mezonMessage } = finishPartParams;
    const userAnswers = await this.userAnswerService.getUserAnswersByPartAndTest(testId, partId, userId);
    await showAnswerReviewMessage({
      mezonMessage: mezonMessage,
      mezonUserId: mezonUserId,
      userAnswers: userAnswers,
    });

    const newBadges = await this.userStatService.addPartScore(testId, partId, userId);
    await sendAchievementBadgeReply(newBadges, this.mezonMessage);
  }
}
