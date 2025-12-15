import { Injectable, Logger, Scope } from "@nestjs/common";
import { UserService } from "../../user/user.service";
import { ToeicQuestionService } from "../../toeic/services/toeic-question.service";
import { ChannelMessageContent, EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Cron } from "@nestjs/schedule";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { TOEIC_TIPS } from "../constants/tips.constant";

@Injectable()
export class DailyReminderTask {
  private readonly logger = new Logger(DailyReminderTask.name);

  constructor(
    private readonly client: MezonClient,
    private readonly userService: UserService,
    private readonly toeicQuestionService: ToeicQuestionService,
  ) { }

  //@Cron("0 8-22 * * *")
  async sendDailyMessageToAllUsers() {
    try {
      const batchSize = 100;
      let offset = 0;

      while (true) {
        const users = await this.userService.getAllUsersInBatches(batchSize, offset);
        if (!users.length) {
          break;
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

        offset += batchSize;
      }
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
      messagePayload = await this.buildRandomTipMessage();
    }

    await this.sendDM(userMezonId, messagePayload);
  }

  private async sendDM(userMezonId: string, content: ChannelMessageContent) {
    try {
      const user = await this.client.users.fetch(userMezonId);
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


  private buildRandomTipMessage() {
    const greetings = [
      "🌞 *Hello homie, TOEIC learner!*",
      "🔥 *Hi, champ!*",
      "💪 *What’s up, English warrior?*",
      "🚀 *Keep grinding, future 900+ scorer!*",
      "🎯 *Hey legend, ready to learn today?*",
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const randomTip = TOEIC_TIPS[Math.floor(Math.random() * TOEIC_TIPS.length)];

    const message = new MessageBuilder()
      .createEmbed({
        color: "#1e90ff",
        title: `${randomGreeting}`,
        description: `${randomTip}\n\nKeep going — every day counts! 💪`,
        footer: "English Learning Bot",
      })
      .build();

    return message;
  }
}
