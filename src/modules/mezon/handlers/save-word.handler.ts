import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { TopicService } from "../../topic-vocabulary/topic.service";
import { UserService } from "../../user/user.service";
import { User } from "mezon-sdk/dist/cjs/api/api";

interface Word {
  word: string,
  pronounce: string,
  partOfSpeech: string,
  meaning: string,
  exampleSentence: string
}

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_SAVE_WORD)
export class SaveWordHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    protected readonly vocabService: VocabularyService,
    protected readonly topicService: TopicService,
    private readonly userService: UserService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      const user = await this.userService.getUser(mezonUserId);
      if (!user) return;

      const vocab = await this.getVocab();

      if (!vocab) return;
      const { word, pronounce, partOfSpeech, meaning, exampleSentence } = vocab;
      if (!word || !meaning || !partOfSpeech || !meaning || !exampleSentence) {
        await this.mezonMessage.reply({ t: "❗ Please fill in all fields." });
        return;
      }

      const vocabInDB = await this.vocabService.getVocabByWord(word);
      if (vocabInDB) {
        await this.mezonMessage.reply({ t: "❗ This word already exists." });
        return;
      }

      const defaultTopic = await this.topicService.getTopicById(11);
      if (!defaultTopic) return;

      const customWord = await this.vocabService.createVocab({
        word: word,
        pronounce: pronounce,
        partOfSpeech: partOfSpeech,
        meaning: meaning,
        exampleSentence: exampleSentence,
        topic: defaultTopic,
        user: user
      })
      if (!customWord) {
        await this.mezonMessage.update({
          t: "⚠️ An error occurred while saving the vocab. Please try again later."
        });
        return;
      }

      const replyMessage = await this.mezonMessage.update({
        t: "The word has been saved and is being reviewed by the admin. ✅"
      });
      await updateSession(this.mezonMessage.sender_id, undefined, replyMessage.message_id);
    } catch (error) {
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while saving the vocab. Please try again later.",
      });
    }
  }

  private async getVocab(): Promise<Word | null> {
    const extra_data = this.event.extra_data;
    if (!extra_data) {
      await this.mezonMessage.reply({
        t: "❗ Please enter your vocab."
      })
      return null;
    }
    const parsed = JSON.parse(extra_data);
    const word: string = parsed["form-word"];
    const pronounce: string = parsed["form-pronounce"];
    const partOfSpeech: string = parsed["form-part-of-speech"];
    const meaning: string = parsed["form-meaning"];
    const exampleSentence: string = parsed["form-example-sentence"];

    return {
      word: word,
      pronounce: pronounce,
      partOfSpeech: partOfSpeech,
      meaning: meaning,
      exampleSentence: exampleSentence
    }
  }
}
