import { Topic } from "src/entities/topic.entity";

export interface ITopicService {
  getAllTopics(): Promise<Topic[]>;
}