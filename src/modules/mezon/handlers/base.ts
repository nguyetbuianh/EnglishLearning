import {
  MezonClient,
  ChannelMessage,
  DropdownBoxSelected
} from "mezon-sdk";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";

export type MChannelMessage = ChannelMessage & {
  type: "ChannelMessage";
}

export type MMessageButtonClicked = MessageButtonClicked & {
  type: "MessageButtonClicked";
}

export type MDropdownBoxSelected = DropdownBoxSelected & {
  type: "DropdownBoxSelected";
}

export type InteractionEvent =
  | MChannelMessage
  | MMessageButtonClicked
  | MDropdownBoxSelected;

export abstract class BaseHandler<T extends InteractionEvent> {
  protected mezonChanel!: TextChannel;
  protected mezonMessage!: Message;
  protected event!: T;

  constructor(protected readonly client: MezonClient) { }

  private async init(event: T) {
    this.event = event;
    this.mezonChanel = await this.client.channels.fetch(event.channel_id);
    this.mezonMessage = await this.mezonChanel.messages.fetch(String(event.message_id));
  }

  public async process(event: T) {
    await this.init(event);
    await this.handle();
  }

  abstract handle(): Promise<void>;
}
