import { Topic } from "src/entities/topic.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>
  ) { }
  async getAllTopics(): Promise<Topic[]> {
    return this.topicRepo.find({ order: { id: 'ASC' } });
  }
}