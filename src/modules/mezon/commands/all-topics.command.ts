import { CommandHandler } from '../interfaces/command-handler.interface';
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from '../utils/parse-markdown';
import { ChannelMessage } from "mezon-sdk";
import { ITopicVocabularyService } from 'src/modules/topic-vocabulary/interface/topic-vocabulary.service';

export class AllTopicsCommand implements CommandHandler {
  constructor(
    private topicVocabularyService: ITopicVocabularyService
  ) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const topics = await this.topicVocabularyService.findAllTopicVocabulary();
      const text = topics.map(t => `• ${t.name}`).join('\n');

      await message.reply(parseMarkdown(text));

    } catch (error: any) {
      await message.reply(parseMarkdown(`Error displaying guide: ${error.message}`));
    }
  }
}