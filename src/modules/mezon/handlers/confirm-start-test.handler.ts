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
import { PassageService } from "src/modules/toeic/services/passage.service";
import { MMessageButtonClicked } from "./base";

@Injectable()
@Interaction(CommandType.BUTTON_CONFIRM_START_TEST)
export class ConfirmStartTestHandler extends BaseHandler<MMessageButtonClicked> {
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
      const firstQuestion = await this.toeicQuestionService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        return;
      }
      let passageContent = "";
      if (partId === 6 || partId === 7) {
        passageContent = `📖 *Passage ${firstQuestion.passage.passageNumber}*\n${firstQuestion.passage.title ? `**${firstQuestion.passage.title}**\n` : ""}${firstQuestion.passage.content}`;
      }

      ToeicSessionStore.set(mezonUserId, {
        testId: firstQuestion.test.id,
        partId: firstQuestion.part.id,
        currentQuestionNumber: firstQuestion.questionNumber,
        currentPassageNumber: partId === 6 || partId === 7 ? 1 : undefined,
      });

      const buttons = firstQuestion.options.map((opt) =>
        new ButtonBuilder()
          .setId(`user-answer_q:${firstQuestion.id}_a:${opt.optionLabel}_id:${mezonUserId}`)
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

      await this.mezonMessage.update(
        messagePayload,
        undefined,
        messagePayload.attachments
      );;
    } catch (error) {
      await this.mezonMessage.reply({
        t: 'Something went wrong. Please try again later.'
      })
    }
  }
}