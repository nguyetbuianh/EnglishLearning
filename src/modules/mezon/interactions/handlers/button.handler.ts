import { MezonClient } from "mezon-sdk";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { CancelTestButtonHandler } from "../buttons/cancel-test-button.handler";
import { StartTestButtonHandler } from "../buttons/start-test-button.handler";

export async function handleButtonEvent(client: MezonClient, event: MessageButtonClicked, startHandler: StartTestButtonHandler) {
  const customId = event.button_id;
  const channel = await client.channels.fetch(event.channel_id);

  switch (customId) {
    case "button_start_test":
      await startHandler.execute(client, event);
      break;
    case "button_cancel_test":
      await CancelTestButtonHandler(client, event);
      break;
    default:
      await channel.send({ t: "⚠️ The button is not recognized." });
  }
}
