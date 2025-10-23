import { Passage } from "src/entities/passage.entity";
import { Question } from "src/entities/question.entity";
import { ButtonBuilder } from "../builders/button.builder";
import { EButtonMessageStyle } from "mezon-sdk";
import { MessageBuilder } from "../builders/message.builder";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { UserAnswer } from "src/entities/user-answer.entity";

interface QuestionMessageParams {
  question: Question;
  partId: number;
  testId: number;
  passage?: Passage;
  mezonUserId?: string;
  mezonMessage?: Message;
}

export interface AnswerReviewParams {
  mezonMessage: Message;
  mezonUserId?: string;
  userAnswers: {
    question: Question;
    chosenOption: string;
    isCorrect: boolean;
  }[];
}

export async function replyQuestionMessage(questionMessageParams: QuestionMessageParams) {
  const { question, partId, testId, passage, mezonUserId, mezonMessage } = questionMessageParams;
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

export async function showAnswerReviewMessage(answerReviewParams: AnswerReviewParams) {
  const { mezonMessage, mezonUserId, userAnswers } = answerReviewParams;

  const resultsText = userAnswers
    .map(
      (answer) =>
        `Question ${answer.question.questionNumber}: ${answer.chosenOption} ${answer.isCorrect ? "✅" : "❌"
        }`
    )
    .join("\n");

  const nextPartButton = new ButtonBuilder()
    .setId(`next-part_id:${mezonUserId}`)
    .setLabel("Next Part")
    .setStyle(EButtonMessageStyle.SUCCESS)
    .build();

  const messagePayload = new MessageBuilder()
    .createEmbed({
      color: "#3498db",
      title: "📝 Part Review Results",
      description: `
      Here are your answers for this part:

      ${resultsText}

      If you believe any question or answer is incorrect, please contact us to report it.
      `,
    })
    .addButtonsRow([nextPartButton])
    .build();

  await mezonMessage!.update(
    messagePayload,
    undefined,
    messagePayload.attachments
  );
}
