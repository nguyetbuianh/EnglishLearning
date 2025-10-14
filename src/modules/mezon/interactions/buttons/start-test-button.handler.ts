import { MezonClient } from "mezon-sdk";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { Injectable, Logger } from "@nestjs/common";
import { ToeicSessionStore } from "../../session/toeic-session.store";
import { ConfirmStartTestCommandHandler } from "../../commands/confirm-start-test.command";
import { handleBotError } from "../../utils/error-handler";

@Injectable()
export class StartTestButtonHandler {
  private readonly logger = new Logger(StartTestButtonHandler.name);

  constructor(private readonly confirmStartTestHandler: ConfirmStartTestCommandHandler) { }

  async execute(client: MezonClient, event: MessageButtonClicked) {
    const userId = event.sender_id;

    try {
      const channel = await client.channels.fetch(event.channel_id);

      const session = ToeicSessionStore.get(userId);
      if (!session?.testId || !session?.partId) {
        await channel.send({
          t: "⚠️ You need to select Test and Part before starting.",
        });
        return;
      }

      const originalMessage = await channel.messages.fetch(event.message_id);

      (originalMessage as any).content = {
        t: `start ${session.testId} ${session.partId}`,
      };

      await this.confirmStartTestHandler.handle(channel, originalMessage);

      ToeicSessionStore.delete(userId);
    } catch (error: any) {
      this.logger.error(`StartTestButtonHandler error: ${error.message}`);
      await handleBotError(await client.channels.fetch(event.channel_id), error);
    }
  }
}
