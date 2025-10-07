import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import * as dotenv from "dotenv";
import { CommandRouter } from "./router/command.router"; 
import { UserService } from "src/modules/user/user.service";
import { ToeicProgressService } from "../toeic/services/toeic-progress.service";
import { ToeicQuestionService } from "../toeic/services/toeic-question.service";
import { ToeicTestService } from "../toeic/services/toeic-test.service";

dotenv.config();

@Injectable()
export class MezonService implements OnModuleInit {
  private readonly logger = new Logger(MezonService.name);
  private client: MezonClient;
  private readonly commandRouter: CommandRouter;

  constructor(private toeicProgressService: ToeicProgressService,
        private userService: UserService,
        private toeicQuestionService: ToeicQuestionService,
        private toeicTestService: ToeicTestService) {
    this.commandRouter = new CommandRouter(this.toeicProgressService, this.userService, this.toeicQuestionService, this.toeicTestService);
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
