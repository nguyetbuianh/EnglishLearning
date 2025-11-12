import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { VocabularyService } from "./vocabulary.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary
    ])
  ],
  providers: [
    VocabularyService
  ],
  exports: [
    VocabularyService
  ]
})
export class VocabularyModule { }