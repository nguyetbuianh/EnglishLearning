import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler } from "./base";
import { SelectionBuilder } from "../builders/selection.builder";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { MChannelMessage } from "./base";

@Injectable()
@Interaction(CommandType.COMMAND_START)
export class StartTestHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private toeicTestService: ToeicTestService,
    private toeicPartService: ToeicPartService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const tests = await this.toeicTestService.getAllTests();
      const parts = await this.toeicPartService.getAllParts();

      if (!tests.length || !parts.length) {
        await this.mezonMessage.reply({
          t: ("❌ There is no test or part data.")
        });
        return;
      }

      const senderId = this.mezonMessage.sender_id;

      const testSelect = new SelectionBuilder()
        .setId(`toeic-test_id:${senderId}`)
        .setPlaceholder("Select test...")
        .addOptions(
          tests.map((t) => ({
            label: t.title,
            value: String(t.id),
          }))
        )
        .build();

      const partSelect = new SelectionBuilder()
        .setId(`toeic-part_id:${senderId}`)
        .setPlaceholder("Select part...")
        .addOptions(
          parts.map((p) => ({
            label: `Part ${p.partNumber}: ${p.title}`,
            value: String(p.id),
          }))
        )
        .build();

      const startButton = new ButtonBuilder()
        .setId(`start-test_id:${senderId}`)
        .setLabel("✅ Start Test")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${senderId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const payload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: "🎯 TOEIC Test Selection",
          description: "Select the test and part you want to take below:",
        })
        .addSelectRow([testSelect])
        .addSelectRow([partSelect])
        .addButtonsRow([startButton, cancelButton])
        .build();

      await this.mezonMessage.reply(payload);
    } catch (error) {
      console.error("StartTestCommandHandler Error:", error);
      await this.mezonMessage.reply({
        t: ("😢 Oops! Something went wrong. Please try again later!")
      });
    }
  }
}
