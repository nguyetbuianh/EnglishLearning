import { Injectable, Logger } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { EMarkdownType, MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";

@Injectable()
@Interaction(CommandType.COMMAND_ELAKOTHE)
export class ELaKoTheHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      await this.mezonMessage.reply({
        t: 'https://www.youtube.com/watch?v=stvWuowo1dU',
        mk: [{ s: 0, e: 70, type: EMarkdownType.LINK }]
      });
    } catch (error) {
      console.error("❗Error in ELAKOTHEHandler:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.sender_id,
        { t: "😢 Oops! Something went wrong. Please try again later!" }
      );
    }
  }
}