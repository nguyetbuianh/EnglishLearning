import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";

export class ContinueTestCommandHandler implements CommandHandler {
  constructor(private toeicProgressService: ToeicProgressService,
    private toeicQuestionService: ToeicQuestionService
  ) { }

  async handle(channel: TextChannel, message: Message): Promise<void> {
    const progress = await this.toeicProgressService.getLastProgress(message.sender_id);
    if (!progress) {
      await message.reply(parseMarkdown("⚠️ You haven't started any test yet. Use *start <test_id> <part_id>")); return;
    }

    const question = await this.toeicQuestionService.getQuestionById(progress.currentQuestion.id);
    if (!question) {
      await message.reply(parseMarkdown("⚠️ The question you were on no longer exists. Please restart the test."));
      return;
    }

    const optionsText = question.options
      .map(opt => `${opt.option_label}. ${opt.option_text}`)
      .join('\n');

    await message.reply(
      parseMarkdown(
        `✅ Continue Test ${progress.test.id}, Part ${progress.part.id}\n\n` +
        `**Question ${question?.id}:**\n${question?.question_text}\n\n` +
        `${optionsText}\n\n` +
        `👉 Reply with *answer A/B/C/D`
      )
    );
  }
}