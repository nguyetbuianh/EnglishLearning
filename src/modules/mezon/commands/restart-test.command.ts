import { parseMarkdown } from "../utils/parse-markdown";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { ChannelMessage, EButtonMessageStyle } from "mezon-sdk";
import { UserService } from "src/modules/user/user.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { handleBotError } from "../utils/error-handler";
import { UserPartResultService } from "src/modules/toeic/services/user-part-result.service";
import { createButton, createEmbedWithButtons } from "../utils/embed.util";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RestartTestCommandHandler implements CommandHandler {
  constructor(
    private toeicQuestionService: ToeicQuestionService,
    private toeicProgressService: ToeicProgressService,
    private userService: UserService,
    private userPartResultService: UserPartResultService
  ) { }

  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const content = message.content.t?.trim() ?? "";
      const args = content.split(/\s+/);

      const mezonUserId = message.sender_id;
      if (!mezonUserId) {
        await message.reply(parseMarkdown("⚠️ Cannot determine user ID."));
        return;
      }

      const user = await this.userService.getOrCreateUserByMezonId(mezonUserId);

      let testId: number | null = null;
      let partId: number | null = null;

      const progress = await this.toeicProgressService.getLastProgress(message.sender_id);
      if (!progress) {
        await message.reply(
          parseMarkdown("⚠️ You have no active test. Please use *start <test_id> <part_id> first.")
        );
        return;
      }
      testId = progress.test.id;
      partId = progress.part.id;

      await this.toeicProgressService.deleteProgress(user.id, testId, partId);
      await this.userPartResultService.deletePartResult(user.id, testId, partId);

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
