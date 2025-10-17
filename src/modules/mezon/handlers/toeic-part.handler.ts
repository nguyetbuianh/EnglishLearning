import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler } from "./base";
import { ChannelMessage, ChannelMessageContent, IInteractiveMessageProps, MezonClient } from "mezon-sdk";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import { CommandType } from "../enums/commands.enum";

@Interaction("all-part")
@Injectable()
export class ToeicPartHandler extends BaseHandler<ChannelMessage> {
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

      const fields = parts.map((part) => ({
        name: `📘 Part ${part.partNumber}: ${part.title}`,
        value: part.description || "_(No description provided)_",
        inline: false,
      }));

      const embed: IInteractiveMessageProps = {
        color: "#3498db",
        title: "📋 TOEIC PARTS OVERVIEW",
        description:
          "Here are all available TOEIC parts in the system.\n" +
          "Each part focuses on a specific English skill for the TOEIC test.",
        fields,
        footer: {
          text: "Welcome! Choose a TOEIC section and start improving your skills.",
        },
        timestamp: new Date().toISOString(),
      };

      const messagePayload: ChannelMessageContent = {
        t: "✨ TOEIC Parts List",
        embed: [embed],
      };

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      console.error("ToeicPartHandler Error:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while fetching TOEIC parts. Please try again later.",
      });
    }
  }
}
