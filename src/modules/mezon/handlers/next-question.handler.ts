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
import { Passage } from "src/entities/passage.entity";
import { MMessageButtonClicked } from "./base";

interface PartWithPassageParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  currentQuestionNumber: number;
  currentPassageNumber?: number;
}

interface NormalPartParams {
  mezonUserId: string;
  testId: number;
  partId: number;
  currentQuestionNumber: number;
}

interface ReplyMessageParams {
  question: Question;
  partId: number;
  testId: number;
  passage?: Passage;
  mezonUserId?: string;
}

@Injectable()
@Interaction(CommandType.BUTTON_NEXT_QUESTION)
export class NextQuestionHandler extends BaseHandler<MMessageButtonClicked> {
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
    if (!mezonUserId) return;
    const session = ToeicSessionStore.get(mezonUserId);
    if (!session) return;

    const { testId, partId, currentQuestionNumber, currentPassageNumber } = session;

    if (!testId || !partId || !currentQuestionNumber) {
      await this.mezonMessage.reply({ t: "⚠️ Missing session data." });
      return;
    }

    if (partId === 6 || partId === 7) {
      await this.handlePartWithPassage({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        currentQuestionNumber: currentQuestionNumber,
        currentPassageNumber: currentPassageNumber,
      });
    } else {
      await this.handleNormalPart({
        mezonUserId: mezonUserId,
        testId: testId,
        partId: partId,
        currentQuestionNumber: currentQuestionNumber
      });
    }
  }

  private async handlePartWithPassage(partWithPassageParams: PartWithPassageParams) {
    const {
      mezonUserId,
      testId,
      partId,
      currentQuestionNumber,
      currentPassageNumber,
    } = partWithPassageParams;

    const nextQuestionNumber = currentQuestionNumber + 1;
    let question = await this.toeicQuestionService.getQuestionWithPassage(
      testId,
      partId,
      nextQuestionNumber,
      currentPassageNumber
    );

    if (!question) {
      const nextPassageNumber = currentPassageNumber! + 1;
      const nextPassage = await this.passageService.getPassageDetail(
        testId,
        partId,
        nextPassageNumber
      );
      if (!nextPassage) {
        await this.mezonMessage.update(NextQuestionHandler.COMPLETED_MESSAGE);
        return;
      }

      const firstQuestion = await this.toeicQuestionService.getFirstQuestionByPassage(nextPassage.id);
      if (!firstQuestion) {
        await this.mezonMessage.update(NextQuestionHandler.COMPLETED_MESSAGE);
        return;
      }

      this.updateSession(mezonUserId, firstQuestion, nextPassage.passageNumber);
      await this.replyMessage({
        question: firstQuestion,
        partId: partId,
        testId: testId,
        passage: nextPassage,
        mezonUserId: mezonUserId
      });
      return;
    }

    this.updateSession(mezonUserId, question, question.passage?.passageNumber);
    await this.replyMessage({
      question: question,
      partId: partId,
      testId: testId,
      passage: question.passage,
      mezonUserId: mezonUserId
    });
  }

  private async handleNormalPart(normalPartParams: NormalPartParams) {
    const {
      mezonUserId,
      testId,
      partId,
      currentQuestionNumber
    } = normalPartParams;

    const nextQuestionNumber = currentQuestionNumber + 1;
    const question = await this.toeicQuestionService.getQuestion(testId, partId, nextQuestionNumber);
    if (!question) {
      await this.mezonMessage.update(NextQuestionHandler.COMPLETED_MESSAGE);
      return;
    }

    this.updateSession(mezonUserId, question);
    await this.replyMessage({
      question: question,
      partId: partId,
      testId: testId,
      mezonUserId: mezonUserId
    });
  }

  private updateSession(mezonUserId: string, question: Question, passageNumber?: number) {
    ToeicSessionStore.set(mezonUserId, {
      testId: question.test.id,
      partId: question.part.id,
      currentQuestionNumber: question.questionNumber,
      currentPassageNumber: passageNumber,
    });
  }

  private async replyMessage(replyMessageParams: ReplyMessageParams) {
    const { question, partId, testId, passage, mezonUserId } = replyMessageParams;
    const passageContent = passage
      ? `📖 *Passage ${passage.passageNumber}*\n${passage.title ? `**${passage.title}**\n` : ""}${passage.content}`
      : "";

    const buttons = question.options.map(opt =>
      new ButtonBuilder()
        .setId(`answer_${opt.optionLabel}`)
        .setId(`answer_${question.id}_${opt.optionLabel}_${mezonUserId}`)
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

    await this.mezonMessage.update(
      messagePayload,
      undefined,
      messagePayload.attachments
    )
  }
}
