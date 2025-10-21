import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { MChannelMessage } from "./base";

@Interaction(CommandType.WELCOME)
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
                "`*vocab <word>` – Get meaning, examples, synonyms\n" +
                "`*save <word>` – Save the word to your list\n" +
                "`*review` – Review saved vocabulary",
            },
            {
              name: "🧠 QUIZZES",
              value:
                "`*quiz` – Random TOEIC quiz\n" +
                "`*quiz part5` – Grammar & Vocabulary\n" +
                "`*quiz part6` – Text Completion",
            },
            {
              name: "📈 PROGRESS",
              value:
                "`*stats` – View your progress\n" +
                "`*goal <target_score>` – Set your goal\n" +
                "`*rank` – Leaderboard 🔥",
            },
            {
              name: "💬 QUICK START",
              value: "1️⃣ `*vocab hello`\n2️⃣ `*quiz`\n3️⃣ `*save work`",
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
