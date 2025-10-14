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
import { ToeicSessionStore } from "../session/toeic-session.store";

@Injectable()
@Command('confirm_start_test')
export class ConfirmStartTestCommandHandler implements CommandHandler {
  constructor(private toeicQuestionService: ToeicQuestionService,
    private toeicProgressService: ToeicProgressService,
    private userService: UserService) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const mezonUserId = message.sender_id;
      if (!mezonUserId) {
        await message.reply(parseMarkdown("⚠️ Không thể xác định user."));
        return;
      }

      const session = ToeicSessionStore.get(mezonUserId);
      if (!session?.testId || !session?.partId) {
        await message.reply(
          parseMarkdown("⚠️ Bạn chưa chọn Test hoặc Part. Hãy chọn trước khi bắt đầu.")
        );
        return;
      }

      const { testId, partId } = session;
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
          `answer_${opt.optionLabel}`,
          `${opt.optionLabel}. ${opt.optionText}`,
          EButtonMessageStyle.PRIMARY
        )
      );

      const messagePayload = createEmbedWithButtons(
        `Start Test ${testId}, Part ${partId}`,
        firstQuestion.questionNumber,
        firstQuestion.questionText,
        buttons
      );

      await message.reply(messagePayload);
    } catch (error) {
      await handleBotError(channel, error);
    }
  }
}