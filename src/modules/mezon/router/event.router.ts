import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { InteractionFactory } from "./interaction-factory";
import { InteractionEvent } from "../handlers/base";
import { UserService } from "src/modules/user/user.service";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";

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

      const channel = await this.client.channels.fetch(event.channel_id);

      if (this.isCommandEvent(event)) {
        if (!["welcome", "help"].includes(eventName)) {
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
        const userId = (event as MessageButtonClicked).user_id;
        if (ownerId && userId !== ownerId) {
          await this.sendWarning(channel, "❌ You are not allowed to interact with this form.");
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
      const buttonId = event.button_id;
      if (buttonId.startsWith("answer_")) {
        return "answer";
      }
      return event.button_id.split("_").slice(0, 3).join("_");
    }

    if ("content" in event && typeof event.content?.t === "string") {
      const content = event.content.t.trim();
      if (content.startsWith("*")) {
        return content.split(/\s+/)[0].substring(1).toLowerCase();
      }
    }

    return undefined;
  }

  private isCommandEvent(event: InteractionEvent) {
    return (
      "content" in event &&
      typeof event.content?.t === "string" &&
      /^\*[a-zA-Z]/.test(event.content.t.trim())
    );
  }

  private extractOwnerId(event: InteractionEvent): string | undefined {
    if ("button_id" in event && typeof event.button_id === "string") {
      const parts = event.button_id.split("_");
      return parts.length > 0 ? parts[parts.length - 1] : undefined;
    }
    return undefined;
  }

  private async sendWarning(channel: any, message: string) {
    await channel.send({ t: message });
  }
}
