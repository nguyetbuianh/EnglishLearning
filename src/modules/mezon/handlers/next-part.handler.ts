import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { updateSession } from "../utils/update-session.util";
import { replyQuestionMessage } from "../utils/reply-message.util";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { MessageBuilder } from "../builders/message.builder";

@Interaction(CommandType.BUTTON_NEXT_PART)
@Injectable()
export class NextPartHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly userProgressService: UserProgressService,
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
      const nextPart = partId + 1;
      if (nextPart > 7) {
        const messagePayload = new MessageBuilder()
          .createEmbed({
            color: "#00b894",
            title: "🏆 Congratulations!",
            description: `
                🎉 **Amazing work!** You've successfully completed all **7 parts** of the TOEIC test.  
                You're proving that your English skills are getting sharper every step of the way! 💪  

                ✨ Keep up the great work — consistency is the key to mastery!  
                You can now:
                - 🧠 Review your answers and learn from mistakes  
                - 🔁 Try another test to improve your score  
                - ☕ Take a break — you’ve earned it!

                ---

                💬 Type \`*start*\` to take another test or \`*review <test_id>*\` to view your results.
                      `,
            footer: "TOEIC Practice Bot • Keep pushing your limits 🚀",
          })
          .build();
        await this.mezonMessage.update(messagePayload);
        return;
      }

      const question = await this.toeicQuestionService.getFirstQuestion(testId, nextPart);
      if (!question) return;

      await updateSession(mezonUserId, question);

      await this.userProgressService.createProgress({
        userMezonId: mezonUserId,
        testId: testId,
        partId: nextPart,
        currentQuestionNumber: question.questionNumber,
        currentPassageNumber: question.passage ? question.passage.passageNumber : undefined,
      });

      await replyQuestionMessage({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: nextPart,
        question: question,
        passage: question.passage,
        mezonMessage: this.mezonMessage,
      });
    } catch (error) {
      console.error("❗Error in NextPartHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}
