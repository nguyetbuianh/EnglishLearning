import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { MChannelMessage } from "./base";

@Interaction(CommandType.COMMAND_WELCOME)
@Injectable()
export class WelcomeHandler extends BaseHandler<MChannelMessage> {
  constructor(protected readonly client: MezonClient) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const messagePayload = new MessageBuilder()
        .setText("👋 Welcome to English Master Bot!")
        .createEmbed({
          title: "🎓 ENGLISH MASTER BOT",
          description:
            "Your TOEIC study companion powered by AI 💪\n\n" +
            "Improve your vocabulary, grammar, and test skills every day!",
          fields: [
            {
              name: "📘 VOCABULARY",
              value:
                " – Get meaning, examples, synonyms\n" +
                " – Save the word to your list\n" +
                " – Review saved vocabulary",
            },
            {
              name: "🧠 QUIZZES",
              value:
                "`quiz` – TOEIC quiz\n" +
                "`part1` – Photographs\n" +
                "`part2` – Question–Response\n" +
                "`part3` – Conversations\n" +
                "`part4` – Talks\n" +
                "`part5` – Incomplete Sentences (Grammar & Vocabulary)\n" +
                "`part6` – Text Completion\n" +
                "`part7` – Reading Comprehension",
            },
            {
              name: "📈 PROGRESS",
              value:
                " – View your progress\n",
            },
          ],
          footer: "Study 15 minutes daily – your TOEIC score will soar 🚀",
          timestamp: true,
        })
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}
