import { ButtonComponent, ChannelMessageContent, EButtonMessageStyle, EMessageComponentType, IMessageActionRow } from "mezon-sdk";
import { IEmbedProps } from "../interfaces/embed.interface";

// 1. Tạo hàm helper để tạo button
export function createButton(
  id: string,
  label: string,
  style: EButtonMessageStyle,
  url?: string
): ButtonComponent {
  return {
    type: EMessageComponentType.BUTTON,
    id,
    component: { label, style, url },
  };
}

// Tạo hàm helper để tạo action row
export function createActionRow(...buttons: ButtonComponent[]): IMessageActionRow {
  return { components: buttons };
}

// Tạo hàm helper gửi message có button
export function createMessageWithButtons(
  text: string,
  buttons: ButtonComponent[]
): ChannelMessageContent {
  return {
    t: text,
    components: [createActionRow(...buttons)],
  };
}

// Tạo helper để làm embed đơn giản
export function createEmbedMessage(
  title: string,
  description: string,
  fields?: { name: string; value: string; inline?: boolean }[]
): ChannelMessageContent {
  const embed: IEmbedProps = {
    color: "#3498db",
    title,
    description,
    fields,
    footer: {
      text: "Mezon TOEIC Bot",
      // icon_url: "https://cdn.mezon.vn/footer_icon.png",
    },
    timestamp: new Date().toISOString(),
  };

  return {
    t: "📘 TOEIC Bot Notification",
    embed: [embed],
  };
}

// Helper tạo embed + button
export function createEmbedWithButtons(
  title: string,
  questionNumber: number,
  questionText: string,
  buttons: ButtonComponent[]
): ChannelMessageContent {
  const embed: IEmbedProps = {
    color: "#3498db",
    title,
    fields: [
      { name: `❓ Question ${questionNumber}`, value: questionText }
    ],
    footer: { text: "Mezon TOEIC Bot" },
    timestamp: new Date().toISOString(),
  };

  const actionRow = createActionRow(...buttons);

  return {
    t: "📘 TOEIC Bot Notification",
    embed: [embed],
    components: [actionRow],
  };
}


