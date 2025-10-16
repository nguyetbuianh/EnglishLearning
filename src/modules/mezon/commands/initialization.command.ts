import { CommandType } from "../enums/commands.enum";
import { ChannelMessage, MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";
import { UserService } from "src/modules/user/user.service";

@Interaction("init")
@Injectable()
export class InitializationCommandHandler extends BaseHandler<ChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly userService: UserService,
  ) {
    super(client);
  }
  async handle(): Promise<void> {
    try {
      const mezonUserId = this.mezonMessage.sender_id;
      if (!mezonUserId) {
        await this.mezonMessage.reply({
          t: "Unable to determine user."
        });
        return;
      }

      const existingUser = await this.userService.findUserByMezonId(mezonUserId);
      if (existingUser) {
        await this.mezonMessage.reply({
          t: "You already have an account !"
        });
        return;
      }

      const user = await this.userService.createUserByMezonId(mezonUserId);
      if (!user) {
        await this.mezonMessage.reply({
          t: "Failed to create user. Please try again later."
        });
        return;
      }

      await this.mezonMessage.reply({
        t: `Initialization successful! Hello <@${mezonUserId}>`,
      });
    } catch (error) {
      await this.mezonMessage.reply({
        t: 'Something went wrong. Please try again later.'
      })
    }
  }
}