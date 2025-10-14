import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TopicVocabulary } from "src/entities/topic-vocabulary.entity";
import { TopicVocabularyService } from "./topic-vocabulary.service";

@Module({
  imports: [TypeOrmModule.forFeature([TopicVocabulary])],
  providers: [
    {
      provide: "ITopicVocabularyService", 
      useClass: TopicVocabularyService,
    },
  ],
  exports: ["ITopicVocabularyService"], 
})
export class TopicVocabularyModule {}
