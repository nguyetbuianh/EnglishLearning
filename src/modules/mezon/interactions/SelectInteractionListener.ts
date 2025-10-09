import { MezonClient, EMessageComponentType } from "mezon-sdk";

export function registerSelectInteractionListener(client: MezonClient) {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.componentType !== EMessageComponentType.SELECT) return;

    switch (interaction.customId) {
      case "toeic_test_select":
        const selectedTest = interaction.values[0];
        await interaction.reply({
          content: `📘 You selected test ID: ${selectedTest}`,
          ephemeral: true,
        });
        break;

      case "toeic_part_select":
        const selectedPart = interaction.values[0];
        await interaction.reply({
          content: `🧩 You selected part ID: ${selectedPart}`,
          ephemeral: true,
        });
        break;

      default:
        await interaction.reply({
          content: "⚠️ Unknown select menu.",
          ephemeral: true,
        });
        break;
    }
  });
}
