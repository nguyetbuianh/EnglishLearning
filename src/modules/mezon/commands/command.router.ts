import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { WelcomeCommandHandler } from "./welcome.command";
import { parseMarkdown } from "../utils/parse-markdown";

export class CommandRouter {
  private readonly welcomeHandler = new WelcomeCommandHandler();

  async routeCommand(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const content = message.content.t?.trim();
    if (!content || !content.startsWith("*")) return;

    const command = content.slice(1).toLowerCase();

    if (command === "welcome") {
      try {
        await this.welcomeHandler.handle(channel, message);
      } catch (error: any) {
        console.error("Error executing welcome command:", error);
        await message.reply(
          parseMarkdown(`An error occurred while processing the command.: ${error.message}`)
        );
      }
    }
  }
}
