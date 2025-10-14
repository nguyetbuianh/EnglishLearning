import { CommandHandler } from "../interfaces/command-handler.interface";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
<<<<<<< HEAD
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
import { Command } from "../decorators/command.decorator";
=======
import { ChannelMessage, EButtonMessageStyle } from "mezon-sdk";
import { UserService } from "src/modules/user/user.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { handleBotError } from "../utils/error-handler";
import { createButton, createEmbedWithButtons, createMessageWithButtons } from "../utils/embed.util";
>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d

@Injectable()
@Command('start')
export class StartTestCommandHandler implements CommandHandler {
<<<<<<< HEAD
  constructor(
    private toeicTestService: ToeicTestService,
    private toeicPartService: ToeicPartService
  ) { }
=======
  constructor(private toeicQuestionService: ToeicQuestionService,
    private toeicProgressService: ToeicProgressService,
    private userService: UserService) { }
>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d

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
        id: "select_toeic_test",
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
        id: "select_toeic_part",
        component: {
          placeholder: "Select part...",
          options: parts.map((p) => ({
            label: `Part ${p.partNumber}: ${p.title}`,
            value: String(p.id),
          })),
        },
      };

<<<<<<< HEAD
      const startButton: ButtonComponent = {
        type: EMessageComponentType.BUTTON,
        id: "button_start_test",
        component: {
          label: "✅ Start Test",
          style: EButtonMessageStyle.SUCCESS,
        },
      };
=======
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
>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d

      const cancelButton: ButtonComponent = {
        type: EMessageComponentType.BUTTON,
        id: "button_cancel_test",
        component: {
          label: "❌ Cancel",
          style: EButtonMessageStyle.DANGER,
        },
      };

<<<<<<< HEAD
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
=======
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
>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d
      await handleBotError(channel, error);
    }
  }
}
