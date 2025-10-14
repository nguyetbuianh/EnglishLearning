import { Topic } from "src/entities/topic.entity";
import { ITopicService } from "./interfaces/topic.service";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TopicService implements ITopicService {
  constructor(
    private readonly topicRepo: Repository<Topic>
  ) { }
  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepo.find({ order: { id: 'ASC' } });
  }
}