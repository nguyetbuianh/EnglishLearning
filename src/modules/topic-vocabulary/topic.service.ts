import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Topic } from "../../entities/topic.entity";
import { Repository } from "typeorm";

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicVocabularyRepo: Repository<Topic>
  ) { }

  async getAllTopics(): Promise<Topic[]> {
    return this.topicVocabularyRepo.find({
      order: { id: 'ASC' }
    })
  }

  async save(topic: Topic): Promise<Topic | null> {
    return this.topicVocabularyRepo.save(topic);
  }
}