import { ChannelMessageContent, MezonClient } from "mezon-sdk";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";

export async function CancelTestButtonHandler(
  client: MezonClient,
  event: MessageButtonClicked
) {
  try {
    const channel = await client.channels.fetch(event.channel_id);

    if (event.message_id) {
      const messageToEdit = await channel.messages.fetch(event.message_id);
      const responseText = `❌ You have cancelled your TOEIC test selection.`;
      const updatedPayload: ChannelMessageContent = {
        t: responseText
      };
      await messageToEdit.update(updatedPayload);
    }
  } catch (error) {
    console.error("❗Error handling the cancel test button:", error);
  }
}