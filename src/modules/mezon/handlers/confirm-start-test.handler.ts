import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { UserProgressService } from "src/modules/toeic/services/user-progress.service";
import { updateSession } from "../utils/update-session.util";

@Injectable()
@Interaction(CommandType.BUTTON_CONFIRM_START_TEST)
export class ConfirmStartTestHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private toeicQuestionService: ToeicQuestionService,
    private userProgressService: UserProgressService,
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
      const existingProgress = await this.userProgressService.getProgress(testId, partId, mezonUserId);
      if (existingProgress?.isCompleted === true) {
        await this.sendCompletionMessage(testId, partId, mezonUserId);
        return;
      }
      if (existingProgress) {
        await this.sendContinueOrRestartMessage(testId, partId, mezonUserId);
        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestion(testId, partId);
      if (!firstQuestion) {
        return;
      }
      let passageContent = "";
      if (partId === 6 || partId === 7) {
        passageContent = `📖 *Passage ${firstQuestion.passage.passageNumber}*\n${firstQuestion.passage.title ? `**${firstQuestion.passage.title}**\n` : ""}${firstQuestion.passage.content}`;
      }

      await this.userProgressService.createProgress({
        userMezonId: mezonUserId,
        testId,
        partId,
        currentQuestionNumber: firstQuestion.questionNumber,
        currentPassageNumber: partId === 6 || partId === 7 ? 1 : undefined,
      });
      
      await updateSession(mezonUserId, firstQuestion, this.mezonMessage.id);

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
      console.error("❌ Error in ConfirmStartTestHandler:", error);
      await this.mezonMessage.reply({
        t: '😢 Oops! Something went wrong. Please try again later!'
      })
    }
  }

  private async sendContinueOrRestartMessage(
    testId: number,
    partId: number,
    mezonId: string,
  ): Promise<void> {
    try {
      const continueButton = new ButtonBuilder()
        .setId(`continue-test_id:${mezonId}`)
        .setLabel("Continue Test")
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build();

      const restartButton = new ButtonBuilder()
        .setId(`restart-test_id:${mezonId}`)
        .setLabel("Restart Test")
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build();

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#c12b17ff",
          title: `🟡 You have started the Test ${testId} - Part ${partId}.\n`,
          description: `Choose Continue Test to continue or Restart Test to start over.`,
          footer: `English Learning Bot`,
        })
        .addButtonsRow([continueButton, restartButton])
        .build();

      await this.mezonMessage.update(messagePayload);
    } catch (error) {
      console.error("❌ Error sending answer response:", error);
    }
  }

  private async sendCompletionMessage(
    testId: number,
    partId: number,
    mezonId: string,
  ): Promise<void> {
    try {
      const restartButton = new ButtonBuilder()
        .setId(`restart-test_id:${mezonId}`)
        .setLabel("Restart Test")
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#c12b17ff",
          title: `🟡 You have completed the Test ${testId} - Part ${partId}.\n`,
          description: `Choose Restart Test to start over or Cancel to cancel the test.`,
          footer: `English Learning Bot`,
        })
        .addButtonsRow([restartButton, cancelButton])
        .build();

      await this.mezonMessage.update(messagePayload);
    } catch (error) {
      console.error("❌ Error sending answer response:", error);
      await this.mezonMessage.reply({
        t: ("😢 Oops! Something went wrong. Please try again later!")
      });
    }
  }
}