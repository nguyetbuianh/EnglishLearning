import { MezonClient } from "mezon-sdk";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { replyQuestionMessage } from "../utils/reply-message.util";
import { PassageService } from "src/modules/toeic/services/passage.service";
import { updateSession } from "../utils/update-session.util";
import { UserAnswerService } from "src/modules/toeic/services/user-answer.service";
import { UserService } from "src/modules/user/user.service";
import { Question } from "src/entities/question.entity";
import { Passage } from "src/entities/passage.entity";

interface LoadQuestionParams {
  userId: number;
  mezonUserId: string;
  testId: number;
  partId: number;
  question: Question;
  passage?: Passage;
}

@Injectable()
@Interaction(CommandType.BUTTON_CONTINUE_TEST)
export class ContinueTestHandler extends BaseHandler<MMessageButtonClicked> {
  private static readonly COMPLETED_MESSAGE = { t: "✅ You have completed this part!" };
  constructor(
    protected readonly client: MezonClient,
    private readonly userProgressService: UserProgressService,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly passageService: PassageService,
    private readonly userAnswerService: UserAnswerService,
    private readonly userService: UserService,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      const session = ToeicSessionStore.get(mezonUserId);
      if (!mezonUserId || !session?.testId || !session?.partId) return;

      const { testId, partId } = session;
      const existingProgress = await this.userProgressService.getProgress(testId, partId, mezonUserId);
      if (!existingProgress) {
        return;
      }

      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) {
        return;
      }

      const question = await this.toeicQuestionService.getQuestion(testId, partId, existingProgress.currentQuestionNumber);
      if (!question) {
        const passage = await this.passageService.getPassageDetail(
          testId,
          partId,
          existingProgress.currentPassageNumber
        );
        if (!passage) return this.finishPart(mezonUserId, testId, partId);

        const firstQuestion = await this.toeicQuestionService.getFirstQuestionByPassage(passage.id);
        if (!firstQuestion) {
          await this.mezonMessage.update(ContinueTestHandler.COMPLETED_MESSAGE);
          return;
        }

        await this.loadQuestion({
          userId: user.id,
          mezonUserId: mezonUserId,
          testId: testId,
          partId: partId,
          question: firstQuestion,
          passage: passage
        });
        return;
      }

      await this.loadQuestion({
        userId: user.id,
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        question: question,
        passage: question.passage
      });
    } catch (error) {
      console.error("❗Error handling the continue test:", error);
      await this.mezonMessage.reply({
        t: ("😢 Oops! Something went wrong. Please try again later!")
      });
    }
  }

  private async finishPart(mezonUserId: string, testId: number, partId: number) {
    await this.userProgressService.updateProgress({
      userMezonId: mezonUserId,
      testId: testId,
      partId: partId,
      isCompleted: true,
    });
    await this.mezonMessage.update(ContinueTestHandler.COMPLETED_MESSAGE);
  }

  private async loadQuestion(loadQuestionParams: LoadQuestionParams) {
    const { userId, mezonUserId, testId, partId, question, passage } = loadQuestionParams;

    await this.userProgressService.updateProgress({
      userMezonId: mezonUserId,
      testId: testId,
      partId: partId,
      currentQuestionNumber: question.questionNumber,
      currentPassageNumber: question.passage?.passageNumber,
    });

    updateSession(mezonUserId, question);

    await this.userAnswerService.deleteUserAnswerByUserAndQuestion(userId, question.id);

    await replyQuestionMessage({
      question: question,
      partId: partId,
      testId: testId,
      passage: passage,
      mezonUserId: mezonUserId,
      mezonMessage: this.mezonMessage,
    });
  }
}