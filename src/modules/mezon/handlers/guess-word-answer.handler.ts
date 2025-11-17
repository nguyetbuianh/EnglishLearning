import { Injectable, Scope } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { Vocabulary } from "../../../entities/vocabulary.entity";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { UserStatService } from "../../daily/services/user-stat.service";
import { sendAchievementBadgeReply } from "../utils/reply-message.util";
import { UserService } from "../../user/user.service";

interface ParsedButtonId {
  word: string;
  imageUrl: string;
  maskedWord: string;
}

interface MessageAnswer {
  word: string,
  imageUrl: string,
  maskedWord: string,
  answerValue: string
}

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_GUESS_WORD_ANSWER)
export class GuessWordAnswerHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    protected readonly vocabService: VocabularyService,
    protected readonly userStatService: UserStatService,
    protected readonly userService: UserService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const extra_data = this.event.extra_data;
      if (!extra_data) {
        this.mezonMessage.reply({
          t: "❗ Please enter your answer."
        })
        return;
      }
      const mezonUserId = this.event.user_id;
      const parsed = JSON.parse(extra_data);
      const answerValue = parsed["form-user-guess"];

      const { word, imageUrl, maskedWord } = this.parseButtonId();

      const messageAnswer = await this.sendMessageAnswer({
        word: word,
        imageUrl: imageUrl,
        maskedWord: maskedWord,
        answerValue: answerValue
      });

      const user = await this.userService.getUser(mezonUserId);
      if (!user) {
        this.mezonMessage.reply({
          t: "⚠️ You are not registered. Use *e-init to start."
        })
        return;
      }
      const isCorrect = answerValue.trim().toLowerCase() === word.trim().toLowerCase();
      const newBadges = await this.userStatService.updateUserStats(user.id, isCorrect);
      if (newBadges && newBadges.length > 0) {
        await sendAchievementBadgeReply(newBadges, this.mezonMessage);
      }

      await this.mezonMessage.update(messageAnswer);
    } catch (error) {
      console.error("❗Error in Guess Word Answer Handler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }

  private async sendMessageAnswer(messageAnswer: MessageAnswer) {
    const { word, imageUrl, maskedWord, answerValue } = messageAnswer;
    const isCorrect = answerValue.trim().toLowerCase() === word.trim().toLowerCase();

    const vocab = await this.getVocab(word);

    const messagePayload = new MessageBuilder()
      .createEmbed({
        color: isCorrect ? "#00FF00" : "#FF0000",
        title: isCorrect ? "🎉 Correct Answer!" : "😢 Incorrect Answer!",
        description: `
          ${isCorrect ? "✅ Great job! You guessed it right!" : "❌ Oops! Better luck next time!"}

          🙋‍♂️ *Your answer:* ${answerValue}
          📘 *Correct word:* ${word}

          💡 *Meaning:* ${vocab?.meaning || "_(not provided)_"}
          🔊 *Pronunciation:* ${vocab?.pronounce || "..."} 
          🧩 *Part of Speech:* ${vocab?.partOfSpeech || "—"}
          ✏️ *Example:* "${vocab?.exampleSentence || "No example available."}"

          ---

          🕵️‍♀️ *Hint:* The masked version was: ${maskedWord}
              `,
        imageUrl,
        footer: "Vocabulary Guessing Game • Keep learning! 🌟",
        timestamp: true,
      })
      .build();

    return messagePayload;
  }


  private parseButtonId(): ParsedButtonId {
    const buttonId = this.event.button_id;
    const parts = buttonId.split("_");

    const word = parts.find((w) => w.startsWith("word:"))?.split(":")[1].trim() || "";
    const imageUrl = buttonId.match(/imageUrl:([^_]+)/)?.[1] || "";
    const maskedWord = buttonId.match(/maskedWord:(.+)$/)?.[1] || "";

    return {
      word: word,
      imageUrl: imageUrl,
      maskedWord: maskedWord
    };
  }

  private async getVocab(word): Promise<Vocabulary | null> {
    return await this.vocabService.getVocabByWord(word);
  }
}