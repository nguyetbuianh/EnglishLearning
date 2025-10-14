import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { InteractionFactory } from "./interaction-factory";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CommandRouter {
  constructor(private interactionFactory: InteractionFactory) { }

  async routeCommand(channel: TextChannel, message: Message): Promise<void> {
    const content = message.content.t?.trim();
    if (!content || !content.startsWith("*")) return;

    const command = content.trim().replace(/^\*/, '').split(/\s+/)[0].toLowerCase();
    const handler = this.interactionFactory.getHandler(command);

    if (!handler) {
      await message.reply({
        t: "⚠️ Invalid command. Use *help to see the list of commands."
      });
      return;
    }

    try {
      await handler.handle(channel, message);
    } catch (error) {
      await message.reply({
        t: '⚠️ Something went wrong. Please try again later.'
      })
    }
  }
}