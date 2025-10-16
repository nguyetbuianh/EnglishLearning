import { CommandType } from "../enums/commands.enum";
import { ChannelMessage, MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";
import { UserService } from "src/modules/user/user.service";

@Interaction("init")
@Injectable()
export class InitCommandHandler extends BaseHandler<ChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly userService: UserService,
  ) {
    super(client);
  }
  async handle(): Promise<void> {

    const mezonUserId = this.mezonMessage.sender_id;
    if (!mezonUserId) {
      await this.mezonMessage.reply({
        t: "⚠️ Không thể xác định user."
      });
      return;
    }

    const user = await this.userService.getOrCreateUserByMezonId(mezonUserId);
    if (!user) {
      await this.mezonMessage.reply({
        t: "⚠️ Không thể xác định user."
      });
      return;
    }

  }
}