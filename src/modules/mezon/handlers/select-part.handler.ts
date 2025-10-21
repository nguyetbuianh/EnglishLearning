import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler } from "./base";
import { ToeicSessionStore } from "../session/toeic-session.store";
import { MMessageButtonClicked } from "./base";

@Injectable()
@Interaction(CommandType.SELECT_PART)
export class SelectPartHandler extends BaseHandler<MMessageButtonClicked> {
  private readonly logger = new Logger(SelectPartHandler.name);

  constructor(protected readonly client: MezonClient) {
    super(client);
  }

  async handle(): Promise<void> {
    const userId = this.event.user_id;
    const partId = Number(this.event.extra_data);

    if (!userId) {
      return;
    }

    if (isNaN(partId)) {
      return;
    }

    const currentSession = ToeicSessionStore.get(userId) ?? {};
    ToeicSessionStore.set(userId, {
      ...currentSession,
      partId,
    });

    this.logger.debug(`User ${userId} đã chọn part ${partId}`);
  }
}
