import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TopicVocabulary } from "src/entities/topic-vocabulary.entity";
import { TopicVocabularyService } from "./topic-vocabulary.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TopicVocabulary
    ])
  ],
  providers: [
    TopicVocabularyService
  ],
  exports: [
    TopicVocabularyService
  ]
})
export class TopicVocabularyModule { }