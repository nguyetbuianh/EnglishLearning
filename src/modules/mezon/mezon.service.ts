import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import * as dotenv from "dotenv";
import { CommandRouter } from "./commands/command.router";
import { ToeicService } from "../toeic/toeic.service";

dotenv.config();

@Injectable()
export class MezonService implements OnModuleInit {
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;
  private readonly commandRouter: CommandRouter;

  constructor(private toeicService: ToeicService) {
    this.commandRouter = new CommandRouter(this.toeicService);
  }

  async onModuleInit() {
    try {
      this.client = new MezonClient(process.env.MEZON_BOT_TOKEN!);

      await this.client.login();

      this.client.on("ready", () => {
        this.logger.log("Mezon bot connected successfully");
      });

      this.client.onChannelMessage(async (event) => {
        const text = event?.content?.t?.toLowerCase();

        if (!text) return;

        try {
          const channel = await this.client.channels.fetch(event.channel_id);
          const message = await channel.messages.fetch(String(event.message_id));

          await this.commandRouter.routeCommand(channel, message);
        } catch (err: any) {
          this.logger.error("Error handling message:", err.message);
        }
      });
    } catch (error: any) {
      this.logger.error(`Mezon connection failed: ${error.message}`);
    }
  }
}
