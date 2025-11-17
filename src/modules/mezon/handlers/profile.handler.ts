import { Injectable, Scope } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { BaseHandler, MChannelMessage } from "./base";
import { MessageBuilder } from "../builders/message.builder";
import { UserService } from "../../user/user.service";
import { User } from "../../../entities/user.entity";
import { UserStatService } from "../../daily/services/user-stat.service";
import { CachedUser } from "../../../types/caches/user.cache";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_PROFILE)
export class ProfileHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
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

      const user = await this.userService.getUser(mezonUserId);
      if (!user) {
        return;
      }

      const formattedJoinDate = await this.getJoinAt(user);
      const userStat = await this.userStatService.findUserStats(user.id);

      const badges = userStat ? userStat.badges.slice(-3) : [];
      const points = userStat ? userStat.points : 0;

      const badgeList = badges.length > 0
        ? badges.map(b => `${b}`).join(' |')
        : '_No badges yet_';

      const embedDescription = `
      👤 *Username:* ${username}
      🏅 *Points:* ${points}
      📅 *Joined:* ${formattedJoinDate}\n
      🎖️ *Badges:* ${badgeList}
      `;

      const messagePayload = new MessageBuilder()
        .createEmbed({
          title: "🌟 Your English Learning Profile",
          description: embedDescription.trim(),
          thumbnail: avatarUrl,
          footer: "English Learning Bot",
          timestamp: true,
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

  private getJoinAt(user: User | CachedUser): string {
    const joinAt = user.joinedAt;
    const formattedJoinDate = joinAt.toISOString().split('T')[0];

    return formattedJoinDate;
  }
}
