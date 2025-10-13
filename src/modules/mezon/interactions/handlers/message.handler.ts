// handlers/message.handler.ts
import { MezonClient } from "mezon-sdk";
import { handleBotError } from "../../utils/error-handler";
import { CommandRouter } from "../../router/command.router";

export async function handleMessageEvent(
  client: MezonClient,
  event: any,
  commandRouter: CommandRouter,
) {
  const text = event?.content?.t?.toLowerCase();
  if (!text) return;

  try {
    const channel = await client.channels.fetch(event.channel_id);
    const message = await channel.messages.fetch(String(event.message_id));

    await commandRouter.routeCommand(channel, message);
  } catch (err: any) {
    const channel = await client.channels.fetch(event.channel_id).catch(() => null);
    handleBotError(channel, err);
  }
}
