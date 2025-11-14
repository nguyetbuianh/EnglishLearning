import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { MessageBuilder } from "../builders/message.builder";

@Injectable()
//@Interaction(CommandType.COMMAND_DUYNEN)
export class AnhDuyHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const messagePayload = new MessageBuilder()
        .createEmbed({
          title: "Duy Nến Duy Nến, Tụi tao không cần đèn 💡",
          imageUrl: "https://res.cloudinary.com/dmja4ijh4/image/upload/v1763096774/anhDuy_dyj26x.png",
          audioUrl: "https://res.cloudinary.com/dmja4ijh4/video/upload/v1763096806/DuyNen_wshrx0.mp3"
        })
        .build();
      await this.mezonMessage.reply(
        messagePayload,
        undefined,
        messagePayload.attachments);
    } catch (error) {
      console.error("❗Error in ELAKOTHEHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}