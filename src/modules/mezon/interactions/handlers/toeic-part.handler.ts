import { ChannelMessageContent, MezonClient } from "mezon-sdk";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";

export async function startToeicTestHandler(clients: MezonClient, event: MessageButtonClicked) {
  const channel = await clients.channels.fetch(event.channel_id);
  await channel.send({ t: "🚀 Starting your TOEIC test..." });
}

export async function cancelToeicTestHandler(clients: MezonClient, event: MessageButtonClicked) {
  try {
    const channel = await clients.channels.fetch(event.channel_id);
    if (!event.message_id) return;

    const message = await channel.messages.fetch(event.message_id);
    const updated: ChannelMessageContent = { t: "❌ You have cancelled your TOEIC test selection." };
    await message.update(updated);
  } catch (error) {
    console.error("❗Error handling cancel TOEIC test:", error);
  }
}

export async function selectToeicTestHandler(interaction) {
  const selectedTest = interaction.values[0];
  await interaction.reply({
    content: `📘 You selected test ID: ${selectedTest}`,
    ephemeral: true,
  });
}