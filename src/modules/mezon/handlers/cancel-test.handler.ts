import { MezonClient } from "mezon-sdk";
import { BaseHandler } from "./base";
import { MMessageButtonClicked } from "./base";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { sendCancelMessage } from "../utils/reply-message.util";

@Injectable()
@Interaction(CommandType.BUTTON_CANCEL_TEST)
export class CancelTestHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      await sendCancelMessage(this.mezonMessage);
    } catch (error) {
      console.error("❗Error handling the cancel test button:", error);
      await this.mezonMessage.reply({
        t: ("😢 Oops! Something went wrong. Please try again later!")
      });
    }
  }
}