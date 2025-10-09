import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";

export function handleBotError(channel: TextChannel | null, error: any) {
  console.error("❌ Bot Error:", error);

  try {
    channel?.send?.({ t: '⚠️ Something went wrong. Please try again later.' });
  } catch (sendError) {
    console.error("❌ Failed to send error message:", sendError);
  }
}
