import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { CommandType } from "../enums/commands.enum";
import { EButtonMessageStyle, EMessageComponentType, MezonClient } from "mezon-sdk";
import { MessageBuilder } from "../builders/message.builder";
import { ButtonBuilder } from "../builders/button.builder";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_CHAIN_WORD)
export class ChainWordHandler extends BaseHandler<MMessageButtonClicked> {

  constructor(protected readonly client: MezonClient) {
    super(client);
  }

  async handle(): Promise<void> {
    const userId = this.event.sender_id;

    const submitButton = new ButtonBuilder()
      .setId(`get-word_id:${userId}`)
      .setLabel("🚀 Submit")
      .setStyle(EButtonMessageStyle.SUCCESS)
      .build();

    const cancelButton = new ButtonBuilder()
      .setId(`cancel-test_id:${userId}`)
      .setLabel("🛑 Cancel")
      .setStyle(EButtonMessageStyle.DANGER)
      .build();


    const messagePayload = new MessageBuilder()
      .createEmbed({
        color: "#6a5acd",
        title: "🔤 Word Chain — Your Turn",
        fields: [
          {
            name: "✏️ Enter Your Word",
            value: "Type your word below:",
            inputs: {
              id: "id-word",
              type: EMessageComponentType.INPUT,
              component: {
                id: "id-word",
                placeholder: "Type your next word...",
                defaultValue: "",
                required: true,
              },
            },
          },
        ],
      })
      .addButtonsRow([submitButton, cancelButton])
      .build();

    await this.mezonMessage.reply(messagePayload);
  }
}


