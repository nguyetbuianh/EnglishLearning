import { EMessageComponentType, MezonClient } from "mezon-sdk";
import { handleMessageEvent } from "./handlers/message.handler";
import { handleButtonEvent } from "./handlers/button.handler";
import { handleSelectEvent } from "./handlers/select.handler";
import { CommandRouter } from "../router/command.router";
import { StartTestButtonHandler } from "./buttons/start-test-button.handler";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";

export function registerEventListeners(
  client: MezonClient,
  commandRouter: CommandRouter,
  startHandler: StartTestButtonHandler
) {
  client.on("ready", () => {
    console.log("✅ Mezon bot connected successfully");
  });

  client.onChannelMessage((event) =>
    handleMessageEvent(client, event, commandRouter)
  );

  client.onMessageButtonClicked(async (event: any) => {
    const customId = event.button_id || event.select_id;
    if (customId?.startsWith("select_")) {
      await handleSelectEvent(event);
    }
    else if (customId?.startsWith("button_")) {
      await handleButtonEvent(client, event, startHandler);
    }

    else {
      console.warn("⚠️ Unknown customId:", customId);
    }
  });
}
