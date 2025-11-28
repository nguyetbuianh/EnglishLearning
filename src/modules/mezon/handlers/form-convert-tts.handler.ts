import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { EButtonMessageStyle, EMessageComponentType, MezonClient } from "mezon-sdk";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { ButtonBuilder } from "../builders/button.builder";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_CONVERT_TEXT_TO_SPEECH)
export class ConvertTTSHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.sender_id;
      if (!mezonUserId) return;

      const submitButton = new ButtonBuilder()
        .setId(`convert-text_id:${mezonUserId}`)
        .setLabel("Convert")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonUserId}`)
        .setLabel("Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: "🎯 Add new word",
          description: "Please enter the text that you’d like to convert to speech below:",
          fields: [
            {
              name: "Your Text",
              value: "",
              inputs: {
                id: "form-text",
                type: EMessageComponentType.INPUT,
                component: {
                  id: "form-text",
                  placeholder: "Type your text here...",
                  defaultValue: "",
                  required: true,
                },
              },
            },
          ],
        })
        .addButtonsRow([submitButton, cancelButton])
        .build();

      const replyMessage = await this.mezonMessage.reply(messagePayload);
      await updateSession(mezonUserId, undefined, replyMessage.message_id);
    } catch (error) {
      await this.mezonChannel.sendEphemeral(
        this.event.sender_id,
        { t: "⚠️ An error occurred while loading the convert form. Please try again later." }
      );
    }
  }
}
