import { TopicVocabulary } from "src/entities/topic-vocabulary.entity";
import { ITopicVocabularyService } from "./interface/topic-vocabulary.service";
import { TopicVocabularyResponse } from "./response/topic-vocabulary.response";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class TopicVocabularyService implements ITopicVocabularyService {
  constructor(
    @InjectRepository(TopicVocabulary)
    private readonly topicVocabularyRepository: Repository<TopicVocabulary>
  ){}
  findAllTopicVocabulary(): Promise<TopicVocabularyResponse[]> {
    return this.topicVocabularyRepository.find();
  }
}