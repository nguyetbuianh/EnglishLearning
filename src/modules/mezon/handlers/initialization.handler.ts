import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { Injectable } from "@nestjs/common";
import { BaseHandler } from "./base";
import { UserService } from "src/modules/user/user.service";
import { MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";

@Interaction(CommandType.COMMAND_INIT)
@Injectable()
export class InitializationHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly userService: UserService,
  ) {
    super(client);
  }
  async handle(): Promise<void> {
    try {
      const mezonUserId = this.mezonMessage.sender_id;
      const displayName = this.event.display_name;
      if (!mezonUserId) {
        await this.mezonMessage.reply({
          t: "⚠️ I couldn’t identify your account. Please try again!"
        });
        return;
      }

      const existingUser = await this.userService.findUserByMezonId(mezonUserId);
      if (existingUser) {
        await this.mezonMessage.reply({
          t: "👋 Welcome back! You already have an account."
        });
        return;
      }

      const user = await this.userService.createUserByMezonId(mezonUserId, displayName!);
      if (!user) {
        await this.mezonMessage.reply({
          t: "💥 Something went wrong! Please try again later."
        });
        return;
      }

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#2ecc71",
          title: `🎉 Initialization Successful!`,
          description: `Hello ${displayName || "there"}!  
          Your account has been created successfully.  

          Let’s start improving your English together! 💪  

          👉 To begin, type *e-start to start your first English session!`,
          footer: "English Learning Bot",
        })
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      await this.mezonMessage.reply({
        t: '😢 Oops! Something went wrong. Please try again later!'
      })
    }
  }
}