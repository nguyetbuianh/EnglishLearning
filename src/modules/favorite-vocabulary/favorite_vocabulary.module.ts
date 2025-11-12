import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FavoriteVocabulary } from "../../entities/favorite-vocabulary.entity";
import { FavoriteVocabularyService } from "./favorite-vocabulary.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteVocabulary])
  ],
  providers: [
    FavoriteVocabularyService
  ],
  exports: [
    FavoriteVocabularyService
  ]
})
export class FavoriteVocabularyModule { }