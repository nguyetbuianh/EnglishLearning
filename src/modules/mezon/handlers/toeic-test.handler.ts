import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";
import { MezonClient, IInteractiveMessageProps, ChannelMessageContent } from "mezon-sdk";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { MChannelMessage } from "./base";

@Interaction("all-test")
@Injectable()
export class ToeicTestHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly toeicTestService: ToeicTestService
  ) {
    super(client);
  }
  async handle(): Promise<void> {
    try {
      const tests = await this.toeicTestService.getAllTests();
      if (!tests.length) {
        await this.mezonMessage.reply({
          t: "❌ No TOEIC tests found. Please take the test to get the data."
        });
      }
      const testList = tests.map((test) => ({
        name: `📘 ${test.title}`,
        value: test.description || "_(No description provided)_"
      }));
      const embed: IInteractiveMessageProps = {
        color: "#0c0d0eff",
        title: "📋 TOEIC TESTS OVERVIEW",
        description:
          "Here are all available TOEIC tests in the system.\n" +
          "Each test focuses on a specific English skill for the TOEIC test.",
        fields: testList,
        footer: {
          text: "Welcome! Choose a TOEIC test and start improving your skills.",
        },
        timestamp: new Date().toISOString(),
      }
      const messagePayload: ChannelMessageContent = {
        t: "✨ TOEIC Parts List",
        embed: [embed],
      };

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      console.error("ToeicTestHandler Error:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while fetching TOEIC tests. Please try again later.",
      });
    }
  }
}