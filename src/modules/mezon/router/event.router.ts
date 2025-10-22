import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { InteractionFactory } from "./interaction-factory";
import { InteractionEvent } from "../handlers/base";
import { UserService } from "src/modules/user/user.service";
import { appConfig } from "src/appConfig";

@Injectable()
export class EventRouter {
  private readonly logger = new Logger(EventRouter.name);

  constructor(
    private readonly client: MezonClient,
    private readonly interactionFactory: InteractionFactory,
    private readonly userService: UserService
  ) { }

  public registerListeners() {
    this.client.onChannelMessage((event) =>
      this.handleEvent({ ...event, type: "ChannelMessage" })
    );
    this.client.onMessageButtonClicked((event) =>
      this.handleEvent({ ...event, type: "MessageButtonClicked" })
    );
    this.client.onDropdownBoxSelected((event) =>
      this.handleEvent({ ...event, type: "DropdownBoxSelected" })
    );

    this.logger.log("✅ Mezon event listeners registered.");
  }

  private async handleEvent<T extends InteractionEvent>(event: T) {
    try {
      const eventName = this.getEventName(event);
      if (!eventName) return;

      const channel = await this.client.channels.fetch(event.channel_id);

      if (event.type === "ChannelMessage" && event.content.t!.startsWith("*")) {
        if (!["welcome", "help", "init"].includes(eventName)) {
          const userId = event.sender_id;
          if (!userId) {
            return;
          }
          const existingUser = await this.userService.findUserByMezonId(userId);
          if (!existingUser) {
            await this.sendWarning(channel, "⚠️ You are not registered. Use *init to start.");
            return;
          }
        }
      } else {
        const ownerId = this.extractOwnerId(event);
        if (event.type === "MessageButtonClicked" || event.type === "DropdownBoxSelected") {
          const userId = event.user_id;
          if (ownerId && userId !== ownerId) {
            await this.sendWarning(channel, "❌ You are not allowed to interact with this form.");
            return;
          }
        }
      }

      const handler = this.interactionFactory.getHandler(eventName);
      if (!handler) {
        return;
      }

      await handler.process(event);
    } catch (err: any) {
      this.logger.error(`❌ Error handling event: ${err.message}`);
    }
  }

  private getEventName(event: InteractionEvent): string | undefined {
    if (event.type === "MessageButtonClicked") {
      return event.button_id.split("_")[0];
    }

    if (event.type === "ChannelMessage" && event.content.t) {
      const content = event.content.t!.trim();
      return content.split(/\s+/)[0].substring(1).toLowerCase();
    }

    return undefined;
  }

  private extractOwnerId(event: InteractionEvent): string | undefined {
    if (event.type === "MessageButtonClicked") {
      const buttonId = event.button_id;
      const ownerId = buttonId.split("_").find((p) => p.startsWith("id:"));
      return ownerId ? ownerId.split(":")[1] : undefined;
    }
    return undefined;
  }

  private async sendWarning(channel: any, message: string) {
    await channel.send({ t: message });
  }
}
