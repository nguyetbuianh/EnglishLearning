import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";

@Interaction(CommandType.COMMAND_HELP)
@Injectable()
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
              name: "👋 `*welcome`",
              value: "Show introduction and bot features overview.",
            },
            {
              name: "🚀 `*start`",
              value: "Start your TOEIC learning journey or continue where you left off.",
            },
            {
              name: "⚙️ `init`",
              value: "Set up your TOEIC test data.",
            },
            {
              name: "🧩 `all-part`",
              value: "View all TOEIC parts (Part 1 → Part 7) available for practice.",
            },
            {
              name: "📝 `all-test`",
              value: "Show all available TOEIC tests you can take.",
            },
            {
              name: "🎯 `all-topic`",
              value: "Browse vocabulary and grammar topics for deeper study.",
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
