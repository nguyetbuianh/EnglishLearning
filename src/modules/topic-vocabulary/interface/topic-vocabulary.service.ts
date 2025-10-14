import { TopicVocabularyResponse } from "../response/topic-vocabulary.response";

export interface ITopicVocabularyService {
  findAllTopicVocabulary(): Promise<TopicVocabularyResponse[]>;
}