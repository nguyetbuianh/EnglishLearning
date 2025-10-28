import { Injectable } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { ProfileService } from "../services/profile.service";
import { UserService } from "src/modules/user/user.service";
import { UserProgress } from "src/entities/progress.entity";
import { User } from "src/entities/user.entity";
import { UserStatService } from "src/modules/daily/services/user-stat.service";
import { UserStats } from "src/entities/user-stat.entity";

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

      const formattedJoinDate = await this.getJoinAt(user);
      const userStat = await this.userStatService.findUserStats(user.id);
      if (!userStat) {
        const messagePayload = new MessageBuilder()
          .createEmbed({
            color: "#808080",
            title: "📊 No Statistics Yet",
            description:
              `Hello *${username}*!\n\n` +
              `It looks like you don’t have any learning statistics yet.\n` +
              `🎯 Start completing exercises to track your progress and earn achievements!`,
            imageUrl:
              "https://media0.giphy.com/media/xT9DPldJHzZKtOnEn6/200w.gif",
            footer: "Start your learning journey today! 🚀",
            timestamp: true,
          })
          .build();

        await this.mezonMessage.reply(messagePayload);
        return;
      }

      const buffer = await this.profileService.generateProfileImage(
        username!,
        avatarUrl,
        userStat.badges.slice(-3),
        userStat.points,
        formattedJoinDate
      );

      const result = await this.profileService.uploadProfileImage(buffer, `profiles/${mezonUserId}`);

      const messagePayload = new MessageBuilder()
        .createEmbed({
          title: '👤 Your Profile',
          imageUrl: result.secure_url,
        })
        .build();

      await this.mezonMessage.reply(messagePayload);
    } catch (error) {
      console.error("❗Error in ProfileHandler:", error);
      await this.mezonMessage.reply({
        t: "😢 Oops! Could not generate your profile. Try again later!",
      });
    }
  }

  private async getJoinAt(user: User): Promise<string> {
    const joinAt = user.joinedAt;
    const formattedJoinDate = joinAt.toISOString().split('T')[0];

    return formattedJoinDate;
  }
}
