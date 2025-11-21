import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { EButtonMessageStyle, EMessageComponentType, MezonClient } from "mezon-sdk";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { ButtonBuilder } from "../builders/button.builder";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_ADD_WORD)
export class AddWordHandler extends BaseHandler<MChannelMessage> {
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
        .setId(`save-word_id:${mezonUserId}`)
        .setLabel("💾 Save")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonUserId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: "🎯 Add new word",
          description: "Please enter the new word that you’d like to add below:",
          fields: [
            {
              name: "Your Word",
              value: "",
              inputs: {
                id: "form-word",
                type: EMessageComponentType.INPUT,
                component: {
                  id: "form-word",
                  placeholder: "Type your word here...",
                  defaultValue: "",
                  required: true,
                },
              },
            },
            {
              name: "Pronounce",
              value: "",
              inputs: {
                id: "form-pronounce",
                type: EMessageComponentType.INPUT,
                component: {
                  id: "form-pronounce",
                  placeholder: "Type pronounce here...",
                  defaultValue: "",
                  required: true,
                },
              },
            },
            {
              name: "Part Of Speech",
              value: "",
              inputs: {
                id: "form-part-of-speech",
                type: EMessageComponentType.INPUT,
                component: {
                  id: "form-part-of-speech",
                  placeholder: "Type part of peech here...",
                  defaultValue: "",
                  required: true,
                },
              },
            },
            {
              name: "Meaning",
              value: "",
              inputs: {
                id: "form-meaning",
                type: EMessageComponentType.INPUT,
                component: {
                  id: "form-meaning",
                  placeholder: "Type meaning here...",
                  defaultValue: "",
                  required: true,
                },
              },
            },
            {
              name: "Example Sentence",
              value: "",
              inputs: {
                id: "form-example-sentence",
                type: EMessageComponentType.INPUT,
                component: {
                  id: "form-example-sentence",
                  placeholder: "Type example sentence here...",
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
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading the topic vocabularies. Please try again later.",
      });
    }
  }
}
