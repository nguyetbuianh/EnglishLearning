import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { UserService } from "src/modules/user/user.service";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler } from "./base";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { PassageService } from "src/modules/toeic/services/passage.service";

@Injectable()
@Interaction(CommandType.CONFIRM_START_TEST)
export class ConfirmStartTestHandler extends BaseHandler<MessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private toeicQuestionService: ToeicQuestionService,
    private userService: UserService,
    private readonly passageService: PassageService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) {
        return;
      }

      const session = ToeicSessionStore.get(mezonUserId);
      if (!session?.testId || !session?.partId) {
        await this.mezonMessage.reply({
          t: "⚠️ You have not selected a Test or Part. Please select one before starting."
        });
        return;
      }

      const { testId, partId } = session;
      const existingUser = await this.userService.findUserByMezonId(mezonUserId);
      if (!existingUser) {
        await this.userService.createUserByMezonId(mezonUserId);
      }

      let passageContent = "";
      if (partId === 6 || partId === 7) {
        const passage = await this.passageService.getPassageDetail(testId, partId, 1);
        if (passage) {
          passageContent = `📖 *Passage ${passage.passageNumber}*\n${passage.title ? `**${passage.title}**\n` : ""}${passage.content}`;
        }
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        return;
      }

      ToeicSessionStore.set(mezonUserId, {
        testId: firstQuestion.test.id,
        partId: firstQuestion.part.id,
        currentQuestionNumber: firstQuestion.questionNumber,
        currentPassageNumber: partId === 6 || partId === 7 ? 1 : undefined,
      });

      const buttons = firstQuestion.options.map((opt) =>
        new ButtonBuilder()
          .setId(`answer_${firstQuestion.id}_${opt.optionLabel}_${mezonUserId}`)
          .setLabel(`${opt.optionLabel}. ${opt.optionText}`)
          .setStyle(EButtonMessageStyle.PRIMARY)
          .build()
      );

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `Question ${firstQuestion.questionNumber}`,
          description:
            passageContent.length > 0
              ? `${passageContent}\n\n**Question:** ${firstQuestion.questionText}`
              : firstQuestion.questionText,
          imageUrl: firstQuestion.imageUrl ?? undefined,
          audioUrl: firstQuestion.audioUrl ?? undefined,
        })
        .setText(`Start Test ${testId}, Part ${partId}`)
        .addButtonsRow(buttons)
        .build();

      await this.mezonMessage.reply(
        messagePayload,
        undefined, // mentions
        messagePayload.attachments
      );
    } catch (error) {
      await this.mezonMessage.reply({
        t: 'Something went wrong. Please try again later.'
      })
    }
  }
}