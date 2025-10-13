import { MezonClient } from "mezon-sdk";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { CancelTestButtonHandler } from "../buttons/cancel-test-button.handler";
import { StartTestCommandHandler } from "../../commands/start-test.command";

export async function handleButtonEvent(client: MezonClient, event: MessageButtonClicked) {
  const customId = event.button_id;
  const channel = await client.channels.fetch(event.channel_id);

  switch (customId) {
    case "toeic_start_test":
      await StartTestCommandHandler;
      break;
    case "toeic_cancel_test":
      await CancelTestButtonHandler(client, event);
      break;
    default:
      await channel.send({ t: "⚠️ The button is not recognized." });
  }
}
