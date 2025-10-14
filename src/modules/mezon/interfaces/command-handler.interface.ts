import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";

export interface CommandHandler {
  handle(channel: TextChannel, message: Message): Promise<void>;
}
