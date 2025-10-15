import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { InteractionFactory } from "./interaction-factory";
import { InteractionEvent } from "../commands/base";

@Injectable()
export class EventRouter {
  private readonly logger = new Logger(EventRouter.name);

  constructor(
    private readonly client: MezonClient,
    private readonly interactionFactory: InteractionFactory
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
}
