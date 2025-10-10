import { parseMarkdown } from "../utils/parse-markdown";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { ChannelMessage, EButtonMessageStyle } from "mezon-sdk";
import { UserService } from "src/modules/user/user.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { handleBotError } from "../utils/error-handler";
import { createButton, createEmbedWithButtons, createMessageWithButtons } from "../utils/embed.util";
import { Injectable } from "@nestjs/common";
import { Command } from "../decorators/command.decorator";

@Injectable()
@Command('confirm_start_test')
export class ConfirmStartTestCommandHandler implements CommandHandler {
  constructor(private toeicQuestionService: ToeicQuestionService,
    private toeicProgressService: ToeicProgressService,
    private userService: UserService) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const content = message.content.t?.trim() ?? "";
      const args = content.split(/\s+/);

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

      const existingProgress = await this.toeicProgressService.getProgress(user.id, testId, partId);
      if (existingProgress) {
        await message.reply(
          parseMarkdown(
            `🟡 You have started the Test ${testId} - Part ${partId}.\n` +
            `Type *continue to continue or *restart to start over.`
          )
        );
        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        await message.reply(parseMarkdown("⚠️ No questions found for this test/part."));
        return;
      }

      await this.toeicProgressService.createProgress({
        userId: user.id,
        testId,
        partId,
        currentQuestionId: firstQuestion.id,
      });

      const buttons = firstQuestion.options.map(opt =>
        createButton(
          `answer_${opt.option_label}`,
          `${opt.option_label}. ${opt.option_text}`,
          EButtonMessageStyle.PRIMARY
        )
      );

      const messagePayload = createEmbedWithButtons(
        `Start Test ${testId}, Part ${partId}`,
        firstQuestion.question_number,
        firstQuestion.question_text,
        buttons
      );

      await message.reply(messagePayload);
    } catch (error) {
      await handleBotError(channel, error);
    }
  }
}