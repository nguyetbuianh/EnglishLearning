import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler } from "./base";
import { MessageButtonClicked } from "mezon-sdk/dist/cjs/rtapi/realtime";
import { ToeicSessionStore } from "../session/toeic-session.store";

@Injectable()
@Interaction(CommandType.SELECT_TEST)
export class SelectTestHandler extends BaseHandler<MessageButtonClicked> {
  private readonly logger = new Logger(SelectTestHandler.name);

  constructor(protected readonly client: MezonClient) {
    super(client);
  }

  async handle(): Promise<void> {
    const userId = this.event.user_id;
    const testId = Number(this.event.extra_data);
    if (!userId) {
      return;
    }

    if (isNaN(testId)) {
      return;
    }

    const currentSession = ToeicSessionStore.get(userId) ?? {};
    ToeicSessionStore.set(userId, {
      ...currentSession,
      testId,
    });

    this.logger.debug(`User ${userId} đã chọn test ${testId}`);
  }
}
