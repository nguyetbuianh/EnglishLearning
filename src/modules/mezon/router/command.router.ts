import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { CommandFactory } from "./command-factory";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommandRouter {
  constructor(private commandFactory: CommandFactory) { }

  async routeCommand(channel: TextChannel, message: Message): Promise<void> {
    const content = message.content.t?.trim();
    if (!content || !content.startsWith("*")) return;

    const command = content.slice(1).toLowerCase();
    const handler = this.commandFactory.getHandler(command);

    if (!handler) {
      await message.reply(parseMarkdown(`⚠️ Invalid command. Use *help to see the list of commands.`));
      return;
    }

    try {
      await handler.handle(channel, message);
    } catch (error) {
      await message.reply('⚠️ Something went wrong. Please try again later.')
    }
  }
}