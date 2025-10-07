import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";

export interface CommandHandler {
  handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void>;
}
