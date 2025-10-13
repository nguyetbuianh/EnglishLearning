import { MezonClient, EMessageComponentType } from "mezon-sdk";

export async function handleSelectEvent(client: MezonClient, interaction: any) {
  if (interaction.componentType !== EMessageComponentType.SELECT) return;

  switch (interaction.customId) {
    case "toeic_test_select":
      await interaction.reply({
        content: `📘 You selected test ID: ${interaction.values[0]}`,
        ephemeral: true,
      });
      break;

    case "toeic_part_select":
      await interaction.reply({
        content: `🧩 You selected part ID: ${interaction.values[0]}`,
        ephemeral: true,
      });
      break;

    default:
      await interaction.reply({
        content: "⚠️ Unknown select menu.",
        ephemeral: true,
      });
  }
}
