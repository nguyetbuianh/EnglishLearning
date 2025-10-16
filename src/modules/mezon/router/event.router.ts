import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { InteractionFactory } from "./interaction-factory";
import { InteractionEvent } from "../commands/base";
import { UserService } from "src/modules/user/user.service";

@Injectable()
export class EventRouter {
  private readonly logger = new Logger(EventRouter.name);

  constructor(
    private readonly client: MezonClient,
    private readonly interactionFactory: InteractionFactory,
    private readonly userService: UserService
  ) { }

  public registerListeners() {
    this.client.onChannelMessage((event) => this.handleEvent(event));
    this.client.onMessageButtonClicked((event) => this.handleEvent(event));
    this.client.onDropdownBoxSelected((event) => this.handleEvent(event));

    this.logger.log("✅ Mezon event listeners registered.");
  }

  private async handleEvent<T extends InteractionEvent>(event: T) {
    try {
      const eventName = this.getEventName(event);
      if (!eventName) return;

      if (!["welcome", "help"].includes(eventName.toLowerCase())) {
        const userId = this.getUserIdFromEvent(event);
        const registered = await this.userService.isRegistered(userId);
        if (!registered) {
          const channel = await this.client.channels.fetch(event.channel_id);
          await channel.send({ t: "You are not registered, please use *init to start." });
          return;
        }
      }

      const handler = this.interactionFactory.getHandler(eventName);

      if (!handler) {
        this.logger.warn(`⚠️ No handler found for event: ${eventName}`);
        return;
      }

      await handler.process(event);
    } catch (err: any) {
      this.logger.error(`❌ Error handling event: ${err.message}`);
    }
  }

  private getEventName(event: InteractionEvent): string | undefined {
    if ("button_id" in event && typeof event.button_id === "string") {
      return event.button_id;
    }

    if ("content" in event && typeof event.content?.t === "string") {
      const content = event.content.t.trim();
      if (content.startsWith("*")) {
        return content.split(/\s+/)[0].substring(1).toLowerCase();
      }
    }

    return "";
  }

  private getUserIdFromEvent(event: InteractionEvent): string {
    return "user_id" in event ? event.sender_id : "";
  }
}
