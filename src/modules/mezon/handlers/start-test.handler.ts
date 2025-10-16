import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import {
  ChannelMessageContent,
  EButtonMessageStyle,
  ChannelMessage,
  MezonClient,
} from "mezon-sdk";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler } from "./base";
import { SelectionBuilder } from "../builders/selection.builder";
import { ButtonBuilder } from "../builders/button.builder";

@Injectable()
@Interaction(CommandType.START)
export class StartTestHandler extends BaseHandler<ChannelMessage> {
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
        .setId(`select_toeic_test_${senderId}`)
        .setPlaceholder("Select test...")
        .addOptions(
          tests.map((t) => ({
            label: t.title,
            value: String(t.id),
          }))
        )
        .build();

      const partSelect = new SelectionBuilder()
        .setId(`select_toeic_part_${senderId}`)
        .setPlaceholder("Select part...")
        .addOptions(
          parts.map((p) => ({
            label: `Part ${p.partNumber}: ${p.title}`,
            value: String(p.id),
          }))
        )
        .build();

      const startButton = new ButtonBuilder()
        .setId(`button_start_test_${senderId}`)
        .setLabel("✅ Start Test")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`button_cancel_test_${senderId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const payload: ChannelMessageContent = {
        t: "🎯 Select the test and section you want to take:",
        components: [
          { components: [testSelect] },
          { components: [partSelect] },
          { components: [startButton, cancelButton] },
        ],
      };

      await this.mezonMessage.reply(payload);
    } catch (error) {
      console.error("StartTestCommandHandler Error:", error);
      await this.mezonMessage.reply({
        t: ("❌ Something is wrong.")
      });
    }
  }
}
