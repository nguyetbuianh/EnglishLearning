import { BaseHandler } from "./base";
import { ChannelMessage, ChannelMessageContent, MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { IInteractiveMessageProps } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";

@Interaction(CommandType.WELCOME)
@Injectable()
export class WelcomeHandler extends BaseHandler<ChannelMessage> {
  constructor(protected readonly client: MezonClient) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const embed: IInteractiveMessageProps = {
        color: "#1abc9c",
        title: "🎓 ENGLISH MASTER BOT",
        description:
          "Your TOEIC study companion powered by AI 💪\n\n" +
          "Improve your vocabulary, grammar, and test skills every day!",
        fields: [
          {
            name: "📘 VOCABULARY",
            value: "`*vocab <word>` – Get meaning, examples, synonyms\n" +
              "`*save <word>` – Save the word to your list\n" +
              "`*review` – Review saved vocabulary",
            inline: false,
          },
          {
            name: "🧠 QUIZZES",
            value: "`*quiz` – Random TOEIC quiz\n" +
              "`*quiz part5` – Grammar & Vocabulary\n" +
              "`*quiz part6` – Text Completion",
            inline: false,
          },
          {
            name: "📈 PROGRESS",
            value: "`*stats` – View your progress\n" +
              "`*goal <target_score>` – Set your goal\n" +
              "`*rank` – Leaderboard 🔥",
            inline: false,
          },
          {
            name: "💬 QUICK START",
            value:
              "1️⃣ `*vocab hello`\n" +
              "2️⃣ `*quiz`\n" +
              "3️⃣ `*save work`",
            inline: false,
          },
        ],
        footer: {
          text: "Study 15 minutes daily – your TOEIC score will soar 🚀",
        },
        timestamp: new Date().toISOString(),
      };

      const messagePayload: ChannelMessageContent = {
        t: "👋 Welcome to English Master Bot!",
        embed: [embed],
      };

      await this.mezonMessage.reply(messagePayload);

    } catch (error) {
      await this.mezonMessage.reply({
        t: '⚠️ Something went wrong. Please try again later.'
      })
    }
  }
}