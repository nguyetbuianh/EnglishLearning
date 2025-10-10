import { MezonClient } from "mezon-sdk";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { CancelTestButtonHandler } from "./buttons/cancel-test-button.handler";

export function registerButtonInteractionListener(client: MezonClient) {
  client.onMessageButtonClicked(async (event: MessageButtonClicked) => {
    const customId = event.button_id;
    const channel = await client.channels.fetch(event.channel_id);

    switch (customId) {
      case "toeic_start_test":
        await channel.send({
          t: "🚀 Start your Toeic test!",
        });
        break;

      case "toeic_cancel_test":
        await CancelTestButtonHandler(client, event);
        break;

      default:
        await channel.send({
          t: "⚠️ The button is not recognized.",
        });
        break;
    }
  });
}
