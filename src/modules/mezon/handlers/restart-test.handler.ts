import { MezonClient } from "mezon-sdk";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { UserProgressService } from "../../toeic/services/user-progress.service";
import { ToeicQuestionService } from "../../toeic/services/toeic-question.service";
import { replyQuestionMessage } from "../utils/reply-message.util";
import { updateSession } from "../utils/update-session.util";
import { UserAnswerService } from "../../toeic/services/user-answer.service";
import { UserService } from "../../user/user.service";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_RESTART_TEST)
export class RestartTestHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly userProgressService: UserProgressService,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly userAnswerService: UserAnswerService,
    private readonly userService: UserService,
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
      const firstQuestion = await this.toeicQuestionService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        return;
      }

      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) {
        return;
      }

      await this.userProgressService.updateProgress({
        userMezonId: mezonUserId,
        testId,
        partId,
        currentQuestionNumber: firstQuestion.questionNumber,
        currentPassageNumber: firstQuestion.passage ? firstQuestion.passage.passageNumber : undefined,
        isCompleted: false
      });

      await updateSession(mezonUserId, firstQuestion, this.mezonMessage.id);

      await this.userAnswerService.deleteUserAnswersByPartAndTest(
        testId,
        partId,
        user.id,
      );

      await replyQuestionMessage({
        question: firstQuestion,
        partId: partId,
        testId: testId,
        passage: firstQuestion.passage,
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