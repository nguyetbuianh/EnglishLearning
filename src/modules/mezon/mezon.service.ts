import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import * as dotenv from "dotenv";
import { CommandRouter } from "./router/command.router";
import { registerEventListeners } from "./interactions/event.router";

dotenv.config();

@Injectable()
export class MezonService implements OnModuleInit {
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;

  constructor(private commandRouter: CommandRouter) { }

  async onModuleInit() {
    try {
      this.client = new MezonClient(process.env.MEZON_BOT_TOKEN!);

      registerEventListeners(this.client, this.commandRouter);

      await this.client.login();
    } catch (error: any) {
      this.logger.error(`Mezon connection failed: ${error.message}`);
    }
  }
}
