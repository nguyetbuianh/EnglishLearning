import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { ProfileService } from "../services/profile.service";
import { UserService } from "src/modules/user/user.service";
import { User } from "src/entities/user.entity";
import { UserStatService } from "src/modules/daily/services/user-stat.service";
import { updateSession } from "../utils/update-session.util";
import { ToeicSessionStore } from "../session/toeic-session.store";

@Interaction(CommandType.COMMAND_PROFILE)
@Injectable()
export class ProfileHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
    private readonly userStatService: UserStatService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.mezonMessage.sender_id!;
      const username = this.event.display_name || this.event.username;
      const avatarUrl = this.event.avatar;

      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) {
        return;
      }

      const waitMessage = await this.mezonMessage.reply({
        t: "⏳ Please wait a moment while I prepare your profile..."
      });

      const formattedJoinDate = await this.getJoinAt(user);
      const userStat = await this.userStatService.findUserStats(user.id);

      const badges = userStat ? userStat.badges.slice(-3) : [];
      const points = userStat ? userStat.points : 0;

      const buffer = await this.profileService.generateProfileImage(
        username!,
        avatarUrl,
        badges,
        points,
        formattedJoinDate
      );

      const result = await this.profileService.uploadProfileImage(buffer, `profiles/${mezonUserId}`);

      const messagePayload = new MessageBuilder()
        .createEmbed({
          title: '👤 Your Profile',
          imageUrl: result.secure_url,
        })
        .build();      

      const oldMessage = await this.mezonChanel.messages.fetch(waitMessage.message_id);
      await oldMessage.update(messagePayload);
    } catch (error) {
      console.error("❗Error in ProfileHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Could not generate your profile. Try again later!",
      });
    }
  }

  private getJoinAt(user: User): string {
    const joinAt = user.joinedAt;
    const formattedJoinDate = joinAt.toISOString().split('T')[0];

    return formattedJoinDate;
  }
}
