import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { MezonClient } from "mezon-sdk";
import { ChannelService } from "src/modules/channel/channel.service";
import { CommandType } from "../enums/commands.enum";
import { Channel } from "src/entities/channel.entity";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_ENGLOVER_HANDLER)
export class SaveChannelHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly channelService: ChannelService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(this.event.channel_id);
      if (!channel.id) {
        return;
      }
      const existingChannel = await this.channelService.existingChannel(channel.id);
      if (!existingChannel) {
        const newChannel = new Channel();
        newChannel.channelId = channel.id;
        newChannel.channelName = channel.name || '';
        await this.channelService.saveChannel(newChannel);
        console.log(`Saved new channel: ${channel.name} (${channel.id})`);
      } else {
        console.debug(`Channel already exists: ${channel.name} (${channel.id})`);
      }
    } catch (error) {
      console.error(`Error saving channel: ${error.message}`);
    }
  }
}
