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
        t: 'https://www.tiktok.com/@anhquanidol.official/video/7439632126149938440',
        mk: [{ s: 0, e: 70, type: EMarkdownType.LINK }]
      });
    } catch (error) {
      console.error("❗Error in ELAKOTHEHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}