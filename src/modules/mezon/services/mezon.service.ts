import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventRouter } from "../router/event.router";

@Injectable()
export class MezonService implements OnModuleInit {
  private readonly logger = new Logger(MezonService.name);

  constructor(private readonly eventRouter: EventRouter) { }

  async onModuleInit() {
    try {
      this.eventRouter.registerListeners();
      this.logger.log("🚀 MezonService initialized and listeners attached.");
    } catch (error) {
      this.logger.error(`❌ Failed to register listeners: ${error.message}`);
    }
  }
}