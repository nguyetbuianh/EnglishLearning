import { Injectable, Scope } from "@nestjs/common";
import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { ToeicQuestionService } from "../../toeic/services/toeic-question.service";
import { UserProgressService } from "../../toeic/services/user-progress.service";
import { UserService } from "../../user/user.service";
import { UserStatService } from "../../daily/services/user-stat.service";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { replyQuestionMessage, sendAchievementBadgeReply, sendCompletionMessage, sendContinueOrRestartMessage, sendNoQuestionsMessage } from "../utils/reply-message.util";
import { updateSession } from "../utils/update-session.util";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_NEXT_PART)
export class NextPartHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly userProgressService: UserProgressService,
    private readonly userService: UserService,
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
      const nextPartId = partId + 1;
      if (nextPartId > 7) {
        const hasCompletedAllParts = await this.userProgressService.hasCompletedAllParts(
          mezonUserId,
          testId,
        );
        if (hasCompletedAllParts) {
          const reviewTestButton = new ButtonBuilder()
            .setId(`review-test_id:${mezonUserId}`)
            .setLabel("Review Test Answers")
            .setStyle(EButtonMessageStyle.SUCCESS)
            .build();

          const messagePayload = new MessageBuilder()
            .createEmbed({
              color: "#00b894",
              title: "🏆 Congratulations!",
              description: `
                🎉 **Amazing work!** You've successfully completed all 7 parts of the TOEIC test.  
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
            .addButtonsRow([reviewTestButton])
            .build();

          await this.mezonMessage.update(messagePayload);

          const user = await this.userService.getUser(mezonUserId);
          if (user) {
            const newBadges = await this.userStatService.addTestScore(testId, user.id);
            if (newBadges && newBadges.length > 0) {
              await sendAchievementBadgeReply(newBadges, this.mezonMessage);
            }
          }

          return;
        }

        const messagePayload = new MessageBuilder()
          .createEmbed({
            color: "#f9ca24",
            title: "⚠️ Almost There!",
            description: `
            You haven’t completed all 7 parts of the TOEIC test yet. 🧩  

            💪 Keep going — you're doing great!  
            Finish every part to unlock your final score and review options. 🚀
            `,
            footer: "TOEIC Practice Bot • Keep pushing your limits 💥",
          })
          .build();

        await this.mezonMessage.update(messagePayload);

        return;
      }

      const userProgress = await this.userProgressService.getProgress(testId, nextPartId, mezonUserId);
      if (userProgress) {
        if (userProgress.isCompleted) {
          await sendCompletionMessage({
            testId: testId,
            partId: nextPartId,
            mezonId: mezonUserId,
            mezonMessage: this.mezonMessage
          });

          await this.updateSession(mezonUserId, testId, nextPartId);

          return;
        }

        await sendContinueOrRestartMessage({
          testId: testId,
          partId: nextPartId,
          questionNumber: userProgress.currentQuestionNumber,
          mezonId: mezonUserId,
          mezonMessage: this.mezonMessage
        });

        await this.updateSession(mezonUserId, testId, nextPartId);

        return;
      }

      const question = await this.toeicQuestionService.getFirstQuestion(testId, nextPartId);
      if (!question) {
        sendNoQuestionsMessage(testId, partId, this.mezonMessage);
        return;
      }

      await updateSession(mezonUserId, question, this.mezonMessage.id);

      await this.userProgressService.saveProgress({
        userMezonId: mezonUserId,
        testId: testId,
        partId: nextPartId,
        currentQuestionNumber: question.questionNumber,
        currentPassageNumber: question.passage ? question.passage.id : undefined,
      });

      await replyQuestionMessage({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: nextPartId,
        question: question,
        passage: question.passage,
        mezonMessage: this.mezonMessage,
      });
    } catch (error) {
      console.error("❗Error in NextPartHandler:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.user_id,
        { t: "😢 Oops! Something went wrong. Please try again later!" }
      );
    }
  }

  private async updateSession(mezonUserId: string, testId: number, partId: number) {
    await ToeicSessionStore.set(mezonUserId, {
      testId: testId,
      partId: partId,
      messageId: this.mezonMessage.id,
    });
  }
}
