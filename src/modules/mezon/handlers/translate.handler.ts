import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { CommandType } from "../enums/commands.enum";
import { MezonClient } from "mezon-sdk";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { ImportWordService } from "../../translaste/import-word.service";
import { MessageBuilder } from "../builders/message.builder";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_TRANSLATE)
export class TranslateHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly vocabularyService: VocabularyService,
    private readonly importWordService: ImportWordService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const content = this.event.content.t || "";
      const textToTranslate = content.replace("*e-translate ", "").trim();

      if (!textToTranslate) {
        await this.mezonMessage.reply({
          t: "⚠️ Please type a word to translate!"
        });
        return;
      }
      const existingWord = await this.vocabularyService.getVocabByWord(textToTranslate);

      if (!existingWord) {
        const translaste = await this.importWordService.importWord(textToTranslate);

        const messagePayload = new MessageBuilder()
          .createEmbed({
            color: "#4A90E2",
            title: `📚 ${translaste.word}`,
            fields: [
              {
                name: "🔊 Pronunciation",
                value: translaste.pronounce,
                inline: true
              },
              {
                name: "🧩 Part of Speech",
                value: translaste.part_of_speech,
                inline: true
              },
              {
                name: "📖 Meaning",
                value: "\n" + translaste.meaning + "\n" // highlight block
              },
              {
                name: "✏️ Example",
                value:
                  "\n" +
                  (translaste.example_sentence || "—") +
                  "\n"
              }
            ],
            footer: "Vocabulary Helper • Keep learning! 🌟",
            timestamp: true
          })
          .build();

        await this.mezonMessage.reply(messagePayload);
        return;
      }

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#4A90E2",
          title: `📚 ${existingWord.word}`,
          fields: [
            {
              name: "🔊 Pronunciation",
              value: existingWord.pronounce,
              inline: true
            },
            {
              name: "🧩 Part of Speech",
              value: existingWord.partOfSpeech,
              inline: true
            },
            {
              name: "📖 Meaning",
              value: "\n" + existingWord.meaning + "\n" // highlight block
            },
            {
              name: "✏️ Example",
              value:
                "\n" +
                (existingWord.exampleSentence || "—") +
                "\n"
            }
          ],
          footer: "Vocabulary Helper • Keep learning! 🌟",
          timestamp: true
        })
        .build();

      await this.mezonMessage.reply(messagePayload);

    } catch (error) {
      console.error("TranslateHandler Error:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!"
      });
    }
  }
}
