import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FavoriteVocabulary } from "../../entities/favorite-vocabulary.entity";
import { FavoriteVocabularyService } from "./favorite-vocabulary.service";
import { FavoriteVocabularyController } from "./favorite_vocabulary.controller";
import { VocabularyModule } from "../vocabulary/vocabulary.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteVocabulary]),
    VocabularyModule
  ],
  controllers: [
    FavoriteVocabularyController
  ],
  providers: [
    FavoriteVocabularyService
  ],
  exports: [
    FavoriteVocabularyService
  ]
})
export class FavoriteVocabularyModule { }