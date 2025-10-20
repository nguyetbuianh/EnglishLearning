import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler } from "./base";
import { EButtonMessageStyle, MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { PassageService } from "src/modules/toeic/services/passage.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { Question } from "src/entities/question.entity";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";

@Injectable()
@Interaction(CommandType.NEXT_QUESTION)
export class NextQuestionHandler extends BaseHandler<MessageButtonClicked> {
  private static readonly COMPLETED_MESSAGE = { t: "✅ You have completed this part!" };

  constructor(
    protected readonly client: MezonClient,
    private readonly toeicQuestionService: ToeicQuestionService,
    private readonly passageService: PassageService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    const mezonUserId = this.event.user_id;
    const session = ToeicSessionStore.get(mezonUserId);
    if (!session) return;

    const { testId, partId, currentQuestionNumber, currentPassageNumber } = session;

    if (!testId || !partId || !currentQuestionNumber) {
      await this.mezonMessage.reply({ t: "⚠️ Missing session data." });
      return;
    }

    if (partId === 6 || partId === 7) {
      await this.handlePartWithPassage(mezonUserId, testId, partId, currentQuestionNumber, currentPassageNumber);
    } else {
      await this.handleNormalPart(mezonUserId, testId, partId, currentQuestionNumber);
    }
  }

  private async handlePartWithPassage(
    mezonUserId: string,
    testId: number,
    partId: number,
    currentQuestionNumber: number,
    currentPassageNumber?: number
  ) {
    let question = await this.toeicQuestionService.getNextQuestionWithPassage(
      testId,
      partId,
      currentQuestionNumber,
      currentPassageNumber
    );

    if (!question) {
      const nextPassage = await this.passageService.getPassageDetail(
        testId,
        partId,
        (currentPassageNumber ?? 1) + 1
      );
      if (!nextPassage) {
        await this.mezonMessage.reply(NextQuestionHandler.COMPLETED_MESSAGE);
        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestionByPassage(nextPassage.id);
      if (!firstQuestion) {
        await this.mezonMessage.reply(NextQuestionHandler.COMPLETED_MESSAGE);
        return;
      }

      this.updateSession(mezonUserId, firstQuestion, nextPassage.passageNumber);
      await this.replyMessage(firstQuestion, partId, testId, nextPassage);
      return;
    }

    this.updateSession(mezonUserId, question, question.passage?.passageNumber);
    await this.replyMessage(question, partId, testId, question.passage);
  }

  private async handleNormalPart(
    mezonUserId: string,
    testId: number,
    partId: number,
    currentQuestionNumber: number
  ) {
    const question = await this.toeicQuestionService.getNextQuestion(testId, partId, currentQuestionNumber);
    if (!question) {
      await this.mezonMessage.reply(NextQuestionHandler.COMPLETED_MESSAGE);
      return;
    }

    this.updateSession(mezonUserId, question);
    await this.replyMessage(question, partId, testId);
  }

  private updateSession(mezonUserId: string, question: Question, passageNumber?: number) {
    ToeicSessionStore.set(mezonUserId, {
      testId: question.test.id,
      partId: question.part.id,
      currentQuestionNumber: question.questionNumber,
      currentPassageNumber: passageNumber,
    });
  }

  private async replyMessage(question: Question, partId: number, testId: number, passage?: any) {
    const passageContent = passage
      ? `📖 *Passage ${passage.passageNumber}*\n${passage.title ? `**${passage.title}**\n` : ""}${passage.content}`
      : "";

    const buttons = question.options.map(opt =>
      new ButtonBuilder()
        .setId(`answer_${opt.optionLabel}`)
        .setLabel(`${opt.optionLabel}. ${opt.optionText}`)
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build()
    );

    const messagePayload = new MessageBuilder()
      .createEmbed({
        color: "#3498db",
        title: `Question ${question.questionNumber}`,
        description: passageContent
          ? `${passageContent}\n\n**Question:** ${question.questionText}`
          : question.questionText,
        imageUrl: question.imageUrl ?? undefined,
        audioUrl: question.audioUrl ?? undefined,
      })
      .setText(`Start Test ${testId}, Part ${partId}`)
      .addButtonsRow(buttons)
      .build();

    await this.mezonMessage.reply(messagePayload, undefined, messagePayload.attachments);
  }
}
