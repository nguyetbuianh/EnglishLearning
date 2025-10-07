import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { CommandFactory } from "./command-factory"; 
import { ToeicService } from "src/modules/toeic/toeic.service";
import { UserService } from "src/modules/user/user.service";

export class CommandRouter {
  private commandFactory: CommandFactory;

  constructor(private toeicService: ToeicService, private readonly userService: UserService) {
    this.commandFactory = new CommandFactory(this.toeicService, this.userService);
  }

  async routeCommand(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const content = message.content.t?.trim();
    if (!content || !content.startsWith("*")) return;

    const command = content.slice(1).toLowerCase();
    const handler = this.commandFactory.getHandler(command);

    if (!handler) {
      await message.reply(parseMarkdown(`⚠️ Invalid command. Use *help to see the list of commands.`));
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
