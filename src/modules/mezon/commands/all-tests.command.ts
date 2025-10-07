import { CommandHandler } from '../interfaces/command-handler.interface';
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from '../utils/parse-markdown';
import { ChannelMessage } from "mezon-sdk";
import { ToeicTestService } from 'src/modules/toeic/services/toeic-test.service';
import { handleBotError } from '../utils/error-handler';

export class AllTestsCommandHandler implements CommandHandler {
  constructor(private toeicTestService: ToeicTestService) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const tests = await this.toeicTestService.getAllTests();
      const text = tests.map(t => `• ${t.title}`).join('\n');

      await message.reply(parseMarkdown(text));

    } catch (error: any) {
      await handleBotError(channel, error);
    }
  }
}