import { Passage } from "../../../entities/passage.entity";
import { Question } from "../../../entities/question.entity";
import { ButtonBuilder } from "../builders/button.builder";
import { ChannelMessageContent, EButtonMessageStyle } from "mezon-sdk";
import { MessageBuilder } from "../builders/message.builder";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { updateSession } from "./update-session.util";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";

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

interface ToeiMessageParams {
  testId: number,
  partId: number,
  questionNumber?: number,
  mezonId: string,
  mezonMessage: Message
}

interface MessageVocabParams {
  mezonUserId: string,
  mezonMessage: Message,
  mezonChannel: TextChannel,
  messagePayload: ChannelMessageContent
}

export async function replyQuestionMessage(questionMessageParams: QuestionMessageParams) {
  const { question, partId, testId, passage, mezonUserId, mezonMessage } = questionMessageParams;
  const passageContent = passage
    ? `📖 *Passage ${passage.passageNumber}*\n${passage.title ? `**${passage.title}**\n` : ""}${passage.content}`
    : "";

  const buttons = question.options.map(opt =>
    new ButtonBuilder()
      .setId(`user-answer_t:test_q:${question.id}_a:${opt.optionLabel}_id:${mezonUserId}`)
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
      footer: "English Learning Bot"
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
      footer: "English Learning Bot"
    })
    .addButtonsRow([nextPartButton])
    .build();

  await mezonMessage!.update(
    messagePayload,
    undefined,
    messagePayload.attachments
  );
}

export async function sendContinueOrRestartMessage(
  toeiMessageParams: ToeiMessageParams
): Promise<void> {
  try {
    const { testId, partId, questionNumber, mezonId, mezonMessage } = toeiMessageParams;
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
        title: `🟡 You have started the Test ${testId} - Part ${partId} - Question ${questionNumber}.\n`,
        description: `Choose Continue Test to continue or Restart Test to start over.`,
        footer: `English Learning Bot`,
      })
      .addButtonsRow([continueButton, restartButton])
      .build();

    await mezonMessage.update(messagePayload);
  } catch (error) {
    console.error("❌ Error sending answer response:", error);
  }
}

export async function sendCompletionMessage(
  toeiMessageParams: ToeiMessageParams
): Promise<void> {
  try {
    const { testId, partId, mezonId, mezonMessage } = toeiMessageParams;
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

    await mezonMessage.update(messagePayload);
  } catch (error) {
    console.error("❌ Error sending answer response:", error);
  }
}

export async function sendAchievementBadgeReply(badgeList: string[], mezonMessage: Message) {
  const formattedBadges = badgeList.map((b) => `🏆 ${b}`).join("\n");
  const messagePayload = new MessageBuilder()
    .createEmbed({
      color: "#FFD700",
      title: "🏅 Congratulations!",
      description: `You’ve just unlocked new achievements!\n\n${formattedBadges}\n\n🎉 Keep shining!`,
      imageUrl: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjltOTc4MTVyb3ZicnZ0eG1yd2c5dmJ1anVlZDh1bXpqZmVjanhrbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hsmUlGtBlroCoU9esb/giphy.gif",
      footer: "Keep it up and collect them all! 🏅",
      timestamp: true,
    })
    .build();

  await mezonMessage.reply(messagePayload);
}

export async function sendNoQuestionsMessage(testId: number, partId: number, mezonMessage: Message) {
  const messagePayload = new MessageBuilder()
    .createEmbed({
      color: "#f8f522fd",
      title: "📭 No Questions Available",
      description:
        `It looks like there are no questions available for *Part ${partId}* in *Test ${testId}* yet.\n\n` +
        `📚 Please check back later when questions have been added.`,
      footer: "Stay tuned — more questions coming soon! 🕓",
      timestamp: true,
    })
    .build();

  await mezonMessage.update(messagePayload);
}

export async function sendCancelMessage(mezonMessage: Message) {
  const messagePayload = new MessageBuilder()
    .createEmbed({
      color: "#db3f34ff",
      title: "❌ TOEIC Test Cancelled",
      description: "You have successfully cancelled your TOEIC test selection. Feel free to start a new test whenever you're ready!",
      footer: "English Learning Bot",
      timestamp: true,
    })
    .build();
  await mezonMessage.update(messagePayload);
}

export async function sendMessageVocab(
  messageVocabParams: MessageVocabParams): Promise<void> {
  let { mezonUserId, mezonMessage, mezonChannel, messagePayload } = messageVocabParams;
  const resetMessage = await mezonMessage.update({
    components: [],
  });

  await mezonMessage.delete();

  mezonMessage = await mezonChannel.messages.fetch(resetMessage.message_id);
  const updateMessage = await mezonChannel.send(messagePayload);

  await updateSession(mezonUserId, undefined, updateMessage.message_id);
}