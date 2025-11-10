import { Injectable, Scope } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_HELP)
export class HelpHandler extends BaseHandler<MChannelMessage> {
  constructor(protected readonly client: MezonClient) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const messagePayload = new MessageBuilder()
        .setText("🧭 English Master Bot – Help Menu")
        .createEmbed({
          title: "📖 AVAILABLE COMMANDS",
          description:
            "Here’s a list of all commands you can use to navigate the bot:\n\n" +
            "Use `*command_name` in the chat to activate each feature.",
          fields: [
            {
              name: "👋 `*e-init`",
              value: "✨ Register with the EnglishLover Bot to start your TOEIC learning journey and get daily study reminders! 💌",
            },
            {
              name: "👤 `*e-profile`",
              value: "View your learning stats, scores, and badges — see how far you’ve come! 🏅",
            },
            {
              name: "🚀 `*e-start`",
              value: "Kick off your TOEIC adventure or continue from where you left off! 💪",
            },
            {
              name: "🧩 `*e-part`",
              value: "Explore all the TOEIC parts (Part 1 → Part 7) and choose your favorite one to practice! 🎯",
            },
            {
              name: "📚 `*e-test`",
              value: "🧠 View all the TOEIC test to practice yourself and track your improvement step by step! 🚀",
            },
            {
              name: "🗂️ `*e-topic`",
              value: "🔍 Explore TOEIC topics to learn vocabulary by theme and strengthen your weak areas! 💪",
            },
            {
              name: "❤️ `*e-my-vocab`",
              value: "View your saved vocabulary words and review them anytime to strengthen your memory! 🧠",
            },
            {
              name: "💡 `*e-help`",
              value: "🔍 Need guidance? Open this help menu anytime to explore all available commands! 🧭",
            },
          ],
          footer: "Enhance your English skills one step at a time! 💪",
          timestamp: true,
        })
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      console.error("❗Error in HelpHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}
