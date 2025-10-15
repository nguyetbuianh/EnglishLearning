import { ChannelMessage, ChannelMessageContent } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { CommandType } from "../enums/commands.enum";
import { IInteractiveMessageProps } from "mezon-sdk";
import { interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";

@interaction(CommandType.WELCOME)
@Injectable()
export class WelcomeCommandHandler extends BaseHandler {
  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
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

      await message.reply(messagePayload);

    } catch (error: any) {
      await message.reply({
        t: '⚠️ Something went wrong. Please try again later.'
      })
    }
  }
}