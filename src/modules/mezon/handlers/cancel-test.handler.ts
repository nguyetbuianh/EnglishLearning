import { ChannelMessageContent, MezonClient } from "mezon-sdk";
import { BaseHandler } from "./base";
import { MMessageButtonClicked } from "./base";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";

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
      const eventMessageId = this.event.message_id;
      if (eventMessageId) {
        const messageToEdit = await this.mezonChanel.messages.fetch(eventMessageId);
        const responseText = `❌ You have cancelled your TOEIC test selection.`;
        const updatedPayload: ChannelMessageContent = {
          t: responseText
        };
        await messageToEdit.update(updatedPayload);
      }
    } catch (error) {
      console.error("❗Error handling the cancel test button:", error);
    }
  }
}