import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import * as dotenv from "dotenv";
import { CommandRouter } from "./router/command.router";
import { registerEventListeners } from "./interactions/event.router";
import { StartTestButtonHandler } from "./interactions/buttons/start-test-button.handler";

dotenv.config();

@Injectable()
export class MezonService implements OnModuleInit {
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;

  constructor(
    private commandRouter: CommandRouter, private startHandler: StartTestButtonHandler
  ) { }

  async onModuleInit() {
    try {
      this.client = new MezonClient({ botId: process.env.MEZON_BOT_ID!, token: process.env.MEZON_BOT_TOKEN! });

      registerEventListeners(this.client, this.commandRouter, this.startHandler);

      await this.client.login();
    } catch (error: any) {
      this.logger.error(`Mezon connection failed: ${error.status} ${error.statusText}`);
    }
  }
}
