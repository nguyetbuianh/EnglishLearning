import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import { handleBotError } from "../utils/error-handler";
import {
  ChannelMessageContent,
  EMessageComponentType,
  SelectComponent,
  ButtonComponent,
  EButtonMessageStyle,
} from "mezon-sdk";
import { parseMarkdown } from "../utils/parse-markdown";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StartTestCommandHandler implements CommandHandler {
  constructor(
    private toeicTestService: ToeicTestService,
    private toeicPartService: ToeicPartService
  ) { }

  async handle(channel: TextChannel, message: Message): Promise<void> {
    try {
      const tests = await this.toeicTestService.getAllTests();
      const parts = await this.toeicPartService.getAllParts();

      if (!tests.length || !parts.length) {
        await message.reply(parseMarkdown("❌ There is no test or part data."));
        return;
      }

      const testSelect: SelectComponent = {
        type: EMessageComponentType.SELECT,
        id: "toeic_test_select",
        component: {
          placeholder: "Select test...",
          options: tests.map((t) => ({
            label: t.title,
            value: String(t.id),
          })),
        },
      };

      const partSelect: SelectComponent = {
        type: EMessageComponentType.SELECT,
        id: "toeic_part_select",
        component: {
          placeholder: "Select part...",
          options: parts.map((p) => ({
            label: `Part ${p.partNumber}: ${p.title}`,
            value: String(p.id),
          })),
        },
      };

      const startButton: ButtonComponent = {
        type: EMessageComponentType.BUTTON,
        id: "toeic_start_test",
        component: {
          label: "✅ Start Test",
          style: EButtonMessageStyle.SUCCESS,
        },
      };

      const cancelButton: ButtonComponent = {
        type: EMessageComponentType.BUTTON,
        id: "toeic_cancel_test",
        component: {
          label: "❌ Cancel",
          style: EButtonMessageStyle.DANGER,
        },
      };

      const payload: ChannelMessageContent = {
        t: "🎯 Select the test and section you want to take:",
        components: [
          { components: [testSelect] },
          { components: [partSelect] },
          { components: [startButton, cancelButton] },
        ],
      };

      await channel.send(payload);
    } catch (error: any) {
      await handleBotError(channel, error);
    }
  }
}
