import { CommandHandler } from './command-handler.interface';
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { ToeicService } from '../../toeic/toeic.service';
import { parseMarkdown } from '../utils/parse-markdown';
import { ChannelMessage } from "mezon-sdk";

export class AllTestCommandHandler implements CommandHandler {
  constructor(private toeicService: ToeicService) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const tests = await this.toeicService.getAllTests();
      const text = tests.map(t => `• ${t.title}`).join('\n');

      await message.reply(parseMarkdown(text));

    } catch (error: any) {
      await message.reply(parseMarkdown(`Error displaying guide: ${error.message}`));
    }
  }
}