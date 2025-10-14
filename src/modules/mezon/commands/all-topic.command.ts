import { Injectable } from "@nestjs/common";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { TopicService } from "src/modules/topic/topic.service";
import { parseMarkdown } from "../utils/parse-markdown";
import { handleBotError } from "../utils/error-handler";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { ChannelMessage } from "mezon-sdk";
import { Command } from "../decorators/command.decorator";

@Injectable()
@Command('all_topics')
export class AllTopicCommandHandler implements CommandHandler {
  constructor(
    private readonly topicService: TopicService
  ) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const topic = await this.topicService.getAllTopics();
      const text = topic.map(t => `• ${t.name}`).join('\n');

      await message.reply(parseMarkdown(text));
    } catch (error) {
      await handleBotError(channel, error);
    }
  }
}