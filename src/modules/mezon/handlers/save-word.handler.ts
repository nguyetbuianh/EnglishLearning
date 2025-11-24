import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { TopicService } from "../../topic-vocabulary/topic.service";
import { UserService } from "../../user/user.service";

interface WordAPI {
  word: string,
  phonetic: string,
  phonetics: [
    {
      text: string,
      audio: string,
      sourceUrl: string,
      license: {
        name: string,
        url: string
      }
    },
    {
      text: string,
      audio: string,
      sourceUrl: string,
      license: {
        name: string,
        url: string
      }
    },
    {
      text: string,
      audio: string,
      sourceUrl: string,
      license: {
        name: string,
        url: string
      }
    }
  ],
  meanings: [
    {
      partOfSpeech: string,
      definitions: [
        {
          definition: string,
          synonyms: string[],
          antonyms: string[]
        }
      ]
    },
    {
      partOfSpeech: string,
      definitions: [
        {
          definition: string,
          synonyms: string[],
          antonyms: string[],
          example: string
        }
      ],
      synonyms: [],
      antonyms: []
    }
  ]
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
      if (!vocab) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "❗ Please fill in all fields." }
        );
        return;
      }

      const vocabInDB = await this.vocabService.getVocabByWord(vocab);
      if (vocabInDB) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "❗ This word already exists." }
        );
        return;
      }

      const dictionaryUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(vocab)}`;
      const response = await fetch(dictionaryUrl);
      if (!response.ok) return;
      const data: WordAPI[] = await response.json();
      if (!data || data.length === 0) return;

      const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(vocab)}&langpair=en|vi`;
      const translateResponse = await fetch(translateUrl);
      let translatedText = "";
      if (translateResponse.ok) {
        const translateData = await translateResponse.json();
        translatedText = translateData.responseData.translatedText || "";
      }

      const defaultTopic = await this.topicService.getTopicById(11);
      if (!defaultTopic) return;

      const customWord = await this.vocabService.createVocab({
        word: vocab,
        pronounce:
          data[0]?.phonetic ||
          data[0]?.phonetics?.find(p => p.text)?.text ||
          "",
        partOfSpeech: data[0]?.meanings?.[0]?.partOfSpeech || "",
        meaning: translatedText || "",
        exampleSentence:
          data[0]?.meanings?.[1]?.definitions?.[0]?.example ||
          data[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
          "",
        topic: defaultTopic,
        user: user
      });
      if (!customWord) return;

      await this.mezonMessage.delete();

      const replyMessage = await this.mezonChannel.sendEphemeral(
        mezonUserId,
        {
          t: `✅ The word "${customWord.word}" has been saved and is being reviewed by the admin.`
        }
      );

      await updateSession(this.mezonMessage.sender_id, undefined, replyMessage.message_id);
    } catch (error) {
      await this.mezonChannel.sendEphemeral(
        this.event.user_id,
        { t: "⚠️ An error occurred while saving the vocab. Please try again later." }
      );
    }
  }

  private async getVocab(): Promise<string | null> {
    const extra_data = this.event.extra_data;
    if (!extra_data) {
      return null;
    }
    const parsed = JSON.parse(extra_data);
    const word: string = parsed["form-word"];

    return word;
  }
}