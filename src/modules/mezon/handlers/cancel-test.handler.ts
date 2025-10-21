import { ChannelMessageContent, MezonClient } from "mezon-sdk";
import { BaseHandler } from "./base";
import { MMessageButtonClicked } from "./base";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { MessageBuilder } from "../builders/message.builder";

@Injectable()
@Interaction(CommandType.CANCEL_TEST)
export class CancelTestHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#db3f34ff",
          title: "❌ TOEIC Test Cancelled",
          description: "You have successfully cancelled your TOEIC test selection. Feel free to start a new test whenever you're ready!",
          footer: "English Learning Bot",
          timestamp: true,
        })
        .build();
      await this.mezonMessage.update(messagePayload);
    } catch (error) {
      console.error("❗Error handling the cancel test button:", error);
    }
  }
}