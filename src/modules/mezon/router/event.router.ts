import { Injectable, Logger } from "@nestjs/common";
import { MezonClient, UserChannelAddedEvent } from "mezon-sdk";
import { InteractionFactory } from "./interaction-factory";
import { InteractionEvent, MChannelMessage } from "../handlers/base";
import { UserService } from "../../user/user.service";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { ModuleRef } from "@nestjs/core";
import { ChannelService } from "../../channel/channel.service";
import { UserChannelRemoved } from "mezon-sdk";
import { appConfig } from "../../../appConfig";

@Injectable()
export class EventRouter {
  private readonly logger = new Logger(EventRouter.name);

  constructor(
    private readonly client: MezonClient,
    private readonly interactionFactory: InteractionFactory,
    private readonly userService: UserService,
    private readonly moduleRef: ModuleRef,
    private readonly channelService: ChannelService
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
    this.client.onUserChannelRemoved((event) =>
      this.handleRemoveBot(event)
    );
    this.client.onUserChannelAdded((event) =>
      this.handleAddBot(event)
    );
    this.logger.log("✅ Mezon event listeners registered.");
  }

  private async handleEvent<T extends InteractionEvent>(event: T) {
    try {
      const eventName = this.getEventName(event);

      if (!eventName) return;

      const channel = await this.client.channels.fetch(event.channel_id);

      if (
        event.type === "ChannelMessage" && (event.content.t!.startsWith("*"))
      ) {
        const userId = event.sender_id;
        if (!userId) {
          return;
        }
        await this.endUserSession(userId, channel, this.logger);

        if (!Object.values(CommandType).includes(eventName as CommandType)) {
          return;
        }
        const command = eventName as CommandType;

        const VALID_COMMANDS: CommandType[] = [
          CommandType.COMMAND_PROFILE,
          CommandType.COMMAND_INIT,
          CommandType.COMMAND_HELP,
          CommandType.COMMAND_START,
          CommandType.COMMAND_ALL_TOPIC,
          CommandType.COMMAND_ALL_TEST,
          CommandType.COMMAND_ALL_PART,
          CommandType.COMMAND_ALL_VOCABULARY_OF_USER,
          CommandType.COMMAND_MY_PROGRESS,
          CommandType.COMMAND_ELAKOTHE,
          CommandType.COMMAND_TRANSLATE,
          CommandType.COMMAND_ADD_WORD,
          CommandType.COMMAND_MY_FLASHCARD,
          CommandType.COMMAND_USER_DICTIONARY,
          CommandType.COMMAND_CHAIN_WORD,
          CommandType.COMMAND_CONVERT_TEXT_TO_SPEECH,
        ];
        if (!VALID_COMMANDS.includes(command)) {
          return;
        }

        const existingUser = await this.userService.getUser(userId);

        const PUBLIC_COMMANDS = [
          CommandType.COMMAND_INIT,
          CommandType.COMMAND_HELP
        ];
        const isPublic = PUBLIC_COMMANDS.includes(command);

        if (!existingUser && !isPublic) {
          await this.sendWarning(channel, "⚠️ You are not registered. Use *e-init to start.", event);
          return;
        }

        const HandlerClass = this.interactionFactory.getConstructor(eventName);
        if (HandlerClass) {
          const handler = await this.moduleRef.create(HandlerClass);
          await handler.process(event);
        }

        return;
      }

      const ownerId = this.extractOwnerId(event);
      if (
        event.type === "MessageButtonClicked" ||
        event.type === "DropdownBoxSelected"
      ) {

        const userId = event.user_id;
        if (ownerId && userId !== ownerId) {
          await this.sendWarning(channel, "❌ You are not allowed to interact with this form.", event);
          return;
        }
      }

      const HandlerClass = this.interactionFactory.getConstructor(eventName);
      if (HandlerClass) {
        const handler = await this.moduleRef.create(HandlerClass);
        await handler.process(event);
      }
    } catch (err) {
      this.logger.error(`❌ Error handling event: ${err.message}`);
    }
  }

  private async handleAddBot(event: UserChannelAddedEvent) {
    const botId = event.users[0].user_id;
    const channelId = event.channel_desc.channel_id;
    const channelName = event.channel_desc.channel_label;

    if (botId === appConfig.bot.id) {
      const existingChannel = await this.channelService.existingChannel(channelId!);
      if (!existingChannel) {
        await this.channelService.saveChannel({
          channelId: channelId,
          channelName: channelName
        });
      } else {
        console.debug(`Channel already exists: ${channelName} (${channelId})`);
      }
    }
  }

  private async handleRemoveBot(event: UserChannelRemoved) {
    const botIdList = event.user_ids;
    if (botIdList.includes(appConfig.bot.id)) {
      await this.channelService.deleteChannel(event.channel_id);
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

  private async sendWarning(
    channel: TextChannel,
    message: string,
    event: InteractionEvent | null = null
  ) {
    if (!event) {
      throw new Error("sendWarning: event is required to send ephemeral message");
    }

    let mezonUserId: string | undefined;

    if (event.type === "ChannelMessage") {
      mezonUserId = event.sender_id;
    } else if (event.type === "MessageButtonClicked") {
      mezonUserId = event.user_id;
    }

    if (!mezonUserId) {
      throw new Error("sendWarning: Unable to resolve mezonUserId");
    }

    return channel.sendEphemeral(mezonUserId, { t: message });
  }

  private async endUserSession(userId: string, channel: TextChannel, logger?: Logger) {
    const existingSession = ToeicSessionStore.get(userId);
    if (!existingSession) return;

    if (existingSession.messageId) {
      try {
        const oldMessage = await channel.messages.fetch(existingSession.messageId);
        const messagePayload = new MessageBuilder()
          .createEmbed({
            color: "#db3f34ff",
            title: "❌ Selection Cancelled",
            description: "Your selection was cancelled. Feel free to make a new choice anytime!",
            footer: "English Learning Bot",
            timestamp: true,
          })
          .build();
        await oldMessage.update(messagePayload);
      } catch (err) {
        logger?.warn?.(`⚠️ Could not edit old message for user ${userId}: ${err.message}`);
      }
    } else {
      logger?.warn?.(`⚠️ No messageId found in session for user ${userId}`);
    }
    ToeicSessionStore.delete(userId);
  }
}
