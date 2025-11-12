import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "../../entities/channel.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>
  ) { }

  async saveChannel(channel: Channel): Promise<Channel> {
    return this.channelRepository.save(channel);
  }

  async existingChannel(channelId: string): Promise<Channel | null> {
    return this.channelRepository.findOne({
      where: { channelId },
    });
  }

  async getChannelsInBatches(limit: number, offset = 0): Promise<Channel[]> {
    return this.channelRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async deleteChannel(channelId: string): Promise<void> {
    await this.channelRepository.delete({ channelId: channelId });
  }
}
