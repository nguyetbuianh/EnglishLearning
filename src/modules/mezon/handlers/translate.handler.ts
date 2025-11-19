import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { CommandType } from "../enums/commands.enum";
import { MezonClient } from "mezon-sdk";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { ImportWordService } from "../../translaste/import-word.service";

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

        const msg =
          `📚 Word: ${translaste.word}
          🔊 Pronunciation: ${translaste.pronounce}  
          🧩 Part of Speech: ${translaste.part_of_speech}
          📖 Meaning:  
          > ${translaste.meaning}
          ✏️ Example:  
          > ${translaste.example_sentence || "—"}`;

        await this.mezonMessage.reply({ t: msg });
        return;
      }

      const msg =
        `📚 Word: ${existingWord.word}
        🔊 Pronunciation: ${existingWord.pronounce || "—"}  
        🧩 Part of Speech: ${existingWord.partOfSpeech || "N/A"}
        📖 Meaning:  
        > ${existingWord.meaning}
        ✏️ Example:
        > ${existingWord.exampleSentence || "—"}`;

      await this.mezonMessage.reply({ t: msg });

    } catch (error) {
      console.error("TranslateHandler Error:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!"
      });
    }
  }
}
