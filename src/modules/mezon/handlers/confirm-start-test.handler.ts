import { MezonClient } from "mezon-sdk";
import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { ToeicQuestionService } from "../../toeic/services/toeic-question.service";
import { UserProgressService } from "../../toeic/services/user-progress.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { replyQuestionMessage, sendCompletionMessage, sendContinueOrRestartMessage, sendNoQuestionsMessage } from "../utils/reply-message.util";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_CONFIRM_START_TEST)
export class ConfirmStartTestHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private toeicQuestionService: ToeicQuestionService,
    private userProgressService: UserProgressService,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) {
        return;
      }

      const session = ToeicSessionStore.get(mezonUserId);
      if (!session?.testId || !session?.partId) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "⚠️ You have not selected a Test or Part. Please select one before starting." }
        );
        return;
      }

      const { testId, partId } = session;
      const existingProgress = await this.userProgressService.getProgress(testId, partId, mezonUserId);
      if (existingProgress?.isCompleted === true) {
        await sendCompletionMessage({
          testId: testId,
          partId: partId,
          mezonId: mezonUserId,
          mezonMessage: this.mezonMessage
        });
        return;
      }
      if (existingProgress) {
        await sendContinueOrRestartMessage({
          testId: testId,
          partId: partId,
          questionNumber: existingProgress.currentQuestionNumber,
          mezonId: mezonUserId,
          mezonMessage: this.mezonMessage
        });
        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        sendNoQuestionsMessage(testId, partId, this.mezonMessage);
        return;
      }
      let passageContent = "";
      if (partId === 6 || partId === 7) {
        passageContent = `📖 *Passage ${firstQuestion.passage.passageNumber}*\n${firstQuestion.passage.title ? `**${firstQuestion.passage.title}**\n` : ""}${firstQuestion.passage.content}`;
      }

      await this.userProgressService.saveProgress({
        userMezonId: mezonUserId,
        testId: testId,
        partId: partId,
        currentQuestionNumber: firstQuestion.questionNumber,
        currentPassageNumber: partId === 6 || partId === 7 ? firstQuestion.passage.id : undefined,
      });

      await updateSession(mezonUserId, firstQuestion, this.mezonMessage.id);

      replyQuestionMessage({
        question: firstQuestion,
        partId: partId,
        testId: testId,
        passage: firstQuestion.passage,
        mezonUserId: mezonUserId,
        mezonMessage: this.mezonMessage,
      });
    } catch (error) {
      console.error("❌ Error in ConfirmStartTestHandler:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.user_id,
        { t: '😢 Oops! Something went wrong. Please try again later!' }
      );
    }
  }
}