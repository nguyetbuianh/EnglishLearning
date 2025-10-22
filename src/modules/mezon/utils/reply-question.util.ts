import { Passage } from "src/entities/passage.entity";
import { Question } from "src/entities/question.entity";
import { ButtonBuilder } from "../builders/button.builder";
import { EButtonMessageStyle } from "mezon-sdk";
import { MessageBuilder } from "../builders/message.builder";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";

interface ReplyMessageParams {
  question: Question;
  partId: number;
  testId: number;
  passage?: Passage;
  mezonUserId?: string;
  mezonMessage?: Message;
}

export async function replyQuestionMessage(replyMessageParams: ReplyMessageParams) {
  const { question, partId, testId, passage, mezonUserId, mezonMessage } = replyMessageParams;
  const passageContent = passage
    ? `📖 *Passage ${passage.passageNumber}*\n${passage.title ? `**${passage.title}**\n` : ""}${passage.content}`
    : "";

  const buttons = question.options.map(opt =>
    new ButtonBuilder()
      .setId(`user-answer_q:${question.id}_a:${opt.optionLabel}_id:${mezonUserId}`)
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

  await mezonMessage!.update(
    messagePayload,
    undefined,
    messagePayload.attachments
  )
}