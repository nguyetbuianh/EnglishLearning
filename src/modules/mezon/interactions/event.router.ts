import { MezonClient } from "mezon-sdk";
import { handleMessageEvent } from "./handlers/message.handler";
import { handleButtonEvent } from "./handlers/button.handler";
import { handleSelectEvent } from "./handlers/select.handler";
import { CommandRouter } from "../router/command.router";

export function registerEventListeners(client: MezonClient, commandRouter: CommandRouter) {
  client.on("ready", () => {
    console.log("✅ Mezon bot connected successfully");
  });

  client.onChannelMessage((event) => handleMessageEvent(client, event, commandRouter));
  client.onMessageButtonClicked((event) => handleButtonEvent(client, event));
  client.on("interactionCreate", (interaction) => handleSelectEvent(client, interaction));
}
