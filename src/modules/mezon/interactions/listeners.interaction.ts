import { EMessageComponentType, MezonClient } from "mezon-sdk";
import { buttonhandler, selectHandler } from "./registry.interaction";

export function registerSelectInteractionListener(client: MezonClient) {
  client.onMessageButtonClicked(async (event) => {
    const handler = buttonhandler[event.button_id];
    if (!handler) {
      const channel = await client.channels.fetch(event.channel_id);
      await channel.send({ t: "⚠️ The button is not recognized." });
      return;
    }
    await handler(client, event);
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.componentType !== EMessageComponentType.SELECT) return;

    const handler = selectHandler[interaction.customId];
    if (!handler) {
      await interaction.reply({ content: "⚠️ Unknown select menu.", ephemeral: true });
      return;
    }
    await handler(interaction);
  });
}