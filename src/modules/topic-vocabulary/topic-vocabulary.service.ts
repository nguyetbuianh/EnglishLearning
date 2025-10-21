import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TopicVocabulary } from "src/entities/topic-vocabulary.entity";
import { Repository } from "typeorm";

@Injectable()
export class TopicVocabularyService {
  constructor(
    @InjectRepository(TopicVocabulary)
    private readonly topicVocabularyRepo: Repository<TopicVocabulary>
  ) { }

  async getAllTopicVocabularies(): Promise<TopicVocabulary[]> {
    return this.topicVocabularyRepo.find({
      order: { id: 'ASC' }
    })
  }
}