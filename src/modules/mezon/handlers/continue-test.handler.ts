import { MezonClient } from "mezon-sdk";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { replyQuestionMessage } from "../utils/reply-question.util";
import { PassageService } from "src/modules/toeic/services/passage.service";
import { updateSession } from "../utils/update-session.util";

@Injectable()
@Interaction(CommandType.BUTTON_CONTINUE_TEST)
export class ContinueTestHandler extends BaseHandler<MMessageButtonClicked> {
  private static readonly COMPLETED_MESSAGE = { t: "✅ You have completed this part!" };
  constructor(
    protected readonly client: MezonClient,
    private userProgressService: UserProgressService,
    private toeicQuestionService: ToeicQuestionService,
    private readonly passageService: PassageService,
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
      const existingProgress = await this.userProgressService.getProgress(mezonUserId, testId, partId);
      if (!existingProgress) {
        return;
      }

      const question = await this.toeicQuestionService.getQuestion(testId, partId, existingProgress.currentQuestionNumber);
      if (!question) {
        const nextPassage = await this.passageService.getPassageDetail(
          testId,
          partId,
          existingProgress.currentPassageNumber
        );
        if (!nextPassage) {
          await this.userProgressService.updateProgress({
            userMezonId: mezonUserId,
            testId,
            partId,
            isCompleted: true,
          });
          await this.mezonMessage.update(ContinueTestHandler.COMPLETED_MESSAGE);
          return;
        }

        const firstQuestion = await this.toeicQuestionService.getFirstQuestionByPassage(nextPassage.id);
        if (!firstQuestion) {
          await this.mezonMessage.update(ContinueTestHandler.COMPLETED_MESSAGE);
          return;
        }

        await this.userProgressService.updateProgress({
          userMezonId: mezonUserId,
          testId,
          partId,
          currentQuestionNumber: firstQuestion.questionNumber,
          currentPassageNumber: firstQuestion.passage.passageNumber,
        });

        updateSession(mezonUserId, firstQuestion);
        await replyQuestionMessage({
          question: firstQuestion,
          partId: partId,
          testId: testId,
          passage: nextPassage,
          mezonUserId: mezonUserId,
          mezonMessage: this.mezonMessage,
        });
        return;
      }

      await this.userProgressService.updateProgress({
        userMezonId: mezonUserId,
        testId,
        partId,
        currentQuestionNumber: question.questionNumber,
        currentPassageNumber: question.passage ? question.passage.passageNumber : undefined,
      });

      ToeicSessionStore.set(mezonUserId, {
        testId: question.test.id,
        partId: question.part.id,
      });

      await replyQuestionMessage({
        question: question,
        partId: partId,
        testId: testId,
        passage: question.passage,
        mezonUserId: mezonUserId,
        mezonMessage: this.mezonMessage,
      });
    } catch (error) {
      console.error("❗Error handling the continue test:", error);
      await this.mezonMessage.reply({
        t: ("😢 Oops! Something went wrong. Please try again later!")
      });
    }
  }
}