import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { CommandFactory } from "./command-factory";

export class CommandRouter {
  async routeCommand(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const content = message.content.t?.trim();
    if (!content || !content.startsWith("*")) return;

    const command = content.slice(1).toLowerCase();
    const handler = CommandFactory.getHandler(command);

    if (!handler) {
      await message.reply(parseMarkdown(`Unknown command: ${command}`));
      return;
    }

    try {
      await handler.handle(channel, message, channelMsg);
    } catch (error: any) {
      console.error(`Error executing command "${command}":`, error);
      await message.reply(
        parseMarkdown(`Error while processing command: ${error.message}`)
      );
    }
  }
}
