import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { ChannelMessage, EButtonMessageStyle } from "mezon-sdk";
import { parseMarkdown } from "../utils/parse-markdown";
import { handleBotError } from "../utils/error-handler";
import { createButton, createEmbedWithButtons } from "../utils/embed.util";
import { UserService } from "src/modules/user/user.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { Injectable } from "@nestjs/common";
import { Command } from "../decorators/command.decorator";

@Injectable()
@Command('next_question')
export class NextQuestionCommandHandler implements CommandHandler {
  constructor(
    private toeicQuestionService: ToeicQuestionService,
    private toeicProgressService: ToeicProgressService,
    private userService: UserService
  ) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const mezonUserId = message.sender_id;
      if (!mezonUserId) {
        await message.reply(parseMarkdown("A valid user ID could not be determined."));
        return;
      }
      const user = await this.userService.getOrCreateUserByMezonId(mezonUserId);

      const progress = await this.toeicProgressService.getLastProgress(message.sender_id);
      if (!progress) {
        await message.reply(parseMarkdown("⚠️ You have not started any test yet. Use *start <test_id> <part_id> first."));
        return;
      }

      const currentQuestion = await this.toeicQuestionService.getQuestionById(progress.currentQuestion.id);
      if (!currentQuestion) {
        await message.reply(parseMarkdown("⚠️ Current question not found."));
        return;
      }

      // Lấy câu hỏi kế tiếp
      const nextQuestion = await this.toeicQuestionService.getNextQuestion(
        progress.test.id,
        progress.part.id,
        currentQuestion.question_number
      );

      if (!nextQuestion) {
        await message.reply(parseMarkdown("🎉 You have completed this test!"));
        await this.toeicProgressService.markCompleted(progress.id);
        return;
      }

      const progressUpdated = {
        userId: user.id,
        testId: progress.test.id,
        partId: progress.part.id,
        currentQuestionId: nextQuestion.id
      }

      // Cập nhật tiến trình
      await this.toeicProgressService.updateProgress(progressUpdated);

      // Tạo nút cho các lựa chọn
      const buttons = nextQuestion.options.map(opt =>
        createButton(
          `answer_${opt.option_label}`,
          `${opt.option_label}. ${opt.option_text}`,
          EButtonMessageStyle.PRIMARY
        )
      );

      const messagePayload = createEmbedWithButtons(
        `Test ${progress.test.id}, Part ${progress.test.id}`,
        nextQuestion.question_number,
        nextQuestion.question_text,
        buttons
      );

      await message.reply(messagePayload);
    } catch (error) {
      await handleBotError(channel, error);
    }
  }
}
