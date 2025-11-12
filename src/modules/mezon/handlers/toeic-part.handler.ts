import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler } from "./base";
import { ChannelMessageContent, IInteractiveMessageProps, MezonClient } from "mezon-sdk";
import { ToeicPartService } from "../../toeic/services/toeic-part.service";
import { MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_ALL_PART)
export class ToeicPartHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly toeicPartService: ToeicPartService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const parts = await this.toeicPartService.getAllParts();

      if (!parts.length) {
        await this.mezonMessage.reply({
          t: "❌ No TOEIC parts found. Please check your data source.",
        });
        return;
      }

      const partList = parts.map((part) => ({
        name: `📘 Part ${part.partNumber}: ${part.title}`,
        value: part.description || "_(No description provided)_"
      }));

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `📋 TOEIC PARTS OVERVIEW`,
          description:
            "Here are all available TOEIC parts in the system.\n" +
            "Each part focuses on a specific English skill for the TOEIC test.",
          fields: partList,
          footer: "Welcome! Choose a TOEIC section and start improving your skills.",
          timestamp: true,
        })
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      console.error("ToeicPartHandler Error:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Something went wrong. Please try again later!",
      });
    }
  }
}
