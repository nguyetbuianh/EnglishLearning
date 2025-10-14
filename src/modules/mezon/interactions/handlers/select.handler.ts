import { MezonClient } from "mezon-sdk";
import { ToeicSessionStore } from "../../session/toeic-session.store";

export async function handleSelectEvent(interaction: any) {
  const userId = interaction.sender_id;

  switch (interaction.button_id) {
    case "select_toeic_test":
      ToeicSessionStore.set(userId, {
        ...(ToeicSessionStore.get(userId) ?? {}),
        testId: Number(interaction.extra_data),
      });
      break;

    case "select_toeic_part":
      ToeicSessionStore.set(userId, {
        ...(ToeicSessionStore.get(userId) ?? {}),
        partId: Number(interaction.extra_data),
      });
      break;

    default:
      break;
  }
}
