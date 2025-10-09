import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { createButton, createEmbedWithButtons } from "../utils/embed.util";
import { EButtonMessageStyle } from "mezon-sdk";

export class ContinueTestCommandHandler implements CommandHandler {
  constructor(
    private toeicProgressService: ToeicProgressService,
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

    const buttons = question.options.map(opt =>
      createButton(
        `answer_${opt.option_label}`,
        `${opt.option_label}. ${opt.option_text}`,
        EButtonMessageStyle.PRIMARY
      )
    );

    const messagePayload = createEmbedWithButtons(
      `Start Test ${progress.test.id}, Part ${progress.part.id}`,
      question?.id,
      question?.question_text,
      buttons
    );

    await message.reply(messagePayload);
  }
}