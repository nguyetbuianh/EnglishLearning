import { ToeicService } from "src/modules/toeic/toeic.service";
import { parseMarkdown } from "../utils/parse-markdown";
import { CommandHandler } from "./command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { ChannelMessage } from "mezon-sdk";
import { UserService } from "src/modules/user/user.service";

export class StartCommandHandler implements CommandHandler {
  constructor(private readonly toeicService: ToeicService,
              private readonly userService: UserService
  ) {}

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const content = message.content.t?.trim() ?? "";
      const args = content.split(/\s+/);

      // Cú pháp: *start <test_id> <part_id>
      if (args.length < 3) {
        await message.reply(parseMarkdown("⚠️ Usage: *start <test_id> <part_id>"));
        return;
      }

      const testId = Number(args[1]);
      const partId = Number(args[2]);

      if (isNaN(testId) || isNaN(partId)) {
        await message.reply(parseMarkdown("⚠️ test_id and part_id must be numbers."));
        return;
      }

      const mezonUserId = message.sender_id;
      if (!mezonUserId) {
        await message.reply(parseMarkdown("A valid user ID could not be determined."));
        return;
      }
      const user = await this.userService.getOrCreateUserByMezonId(mezonUserId);
      const existingProgress = await this.toeicService.getProgress(user.id, testId, partId);

      if (existingProgress) {
        await message.reply(
          parseMarkdown(
            `🟡 You have started the Test ${testId} - Part ${partId}.\n` +
            `Type *continue to continue or *restart to start over.`
          )
        );
        return;
      }

      const firstQuestion = await this.toeicService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        await message.reply(parseMarkdown("⚠️ No questions found for this test/part."));
        return;
      }

      await this.toeicService.createProgress({
        userId: user.id,
        testId,
        partId,
        currentQuestionId: firstQuestion.id,
      });
      
      const optionsText = firstQuestion.options
        .map(opt => `${opt.option_label}. ${opt.option_text}`)
        .join('\n');

      await message.reply(
        parseMarkdown(
          `✅ Start Test ${testId}, Part ${partId}\n\n` +
          `**Question ${firstQuestion.question_number}:**\n${firstQuestion.question_text}\n\n` +
          `${optionsText}\n\n` +
          `👉 Reply with *answer A/B/C/D`
        )
      );
    } catch (error) {
      console.error("Error in StartCommandHandler:", error);
      await message.reply(parseMarkdown("❌ An error occurred while starting the test. Please try again later."));
    }
  }
}