import { Injectable, Logger } from "@nestjs/common";
import { UserService } from "src/modules/user/user.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ChannelMessageContent, EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Cron } from "@nestjs/schedule";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";

@Injectable()
export class DailyReminderTask {
  private readonly logger = new Logger(DailyReminderTask.name);

  constructor(
    private readonly client: MezonClient,
    private readonly userService: UserService,
    private readonly toeicQuestionService: ToeicQuestionService,
  ) { }

  @Cron('*/1 * * * *')
  async handleDailyReminder() {
    try {
      const batchSize = 100;
      const users = await this.userService.getAllUsersInBatches(batchSize);
      if (!users.length) {
        this.logger.warn("⚠️ No active users found for daily reminder.");
        return;
      }

      await Promise.all(
        users.map(async (user) => {
          try {
            await this.sendDailyMessage(user.mezonUserId);
          } catch (err) {
            this.logger.error(`❌ Failed to send to ${user.mezonUserId}`, err);
          }
        })
      );
    } catch (error) {
      this.logger.error("❌ Error sending daily reminders:", error);
    }
  }

  private async sendDailyMessage(userMezonId: string) {
    const random = Math.random();
    let messagePayload;
    if (random < 0.5) {
      messagePayload = await this.buildRandomQuestionMessage();
    } else {
      messagePayload = { t: this.buildRandomTipMessage() };
    }

    await this.sendDM(userMezonId, messagePayload);
  }

  private async sendDM(userMezonId: string, content: ChannelMessageContent) {
    try {
      const dmClan = await this.client.clans.fetch('0');
      const user = await dmClan.users.fetch(userMezonId);
      if (!user) {
        this.logger.warn(`⚠️ User with Mezon ID ${userMezonId} not found.`);
        return;
      }
      await user.sendDM(content);
    } catch (error) {
      this.logger.error(`❌ Failed to send DM to ${userMezonId}:`, error);
    }
  }

  private async buildRandomQuestionMessage() {
    const question = await this.toeicQuestionService.getRandomQuestion();
    if (!question) {
      return {
        content: "❓ No question available at the moment. Please try again later."
      };
    }
    
    const passageContent = question.passage
      ? `📖 *Passage ${question.passage.passageNumber}*\n${question.passage.title
        ? `**${question.passage.title}**\n`
        : ""}${question.passage.content}`
      : "";

    const buttons = question.options.map(opt =>
      new ButtonBuilder()
        .setId(`user-answer_t:daily_q:${question.id}_a:${opt.optionLabel}`)
        .setLabel(`${opt.optionLabel}. ${opt.optionText}`)
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build()
    );

    const embed = {
      color: "#3498db",
      title: `Question ${question.questionNumber}`,
      description: passageContent
        ? `${passageContent}\n\n**Question:** ${question.questionText}`
        : question.questionText,
      imageUrl: question.imageUrl ?? undefined,
      audioUrl: question.audioUrl ?? undefined,
    };

    return new MessageBuilder()
      .setText("🎯 *Daily TOEIC Challenge!*\n💭 Reply with your answer below!")
      .createEmbed(embed)
      .addButtonsRow(buttons)
      .build();
  }

  private buildRandomTipMessage(): string {
    const tips = [
      "💡 *Tip:* In Part 3 & 4, read the questions before listening.",
      "🎧 Listen to short English podcasts daily for better comprehension.",
      "📝 In Part 5, grammar clues around the blank are key.",
      "📖 Focus on full-sentence meaning, not word-by-word translation.",
      "🔥 15 minutes of focused practice daily beats 2 hours once a week!",
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    return `
    🌞 *Good morning, TOEIC learner!*
    ${randomTip}
    Keep going — every day counts! 💪`;
  }
}
