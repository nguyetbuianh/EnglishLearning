import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { VocabularyService } from "./vocabulary.service";
import { PexelsModule } from "../pexels/pexels.module";
import { VocabularyController } from "./vocabulary.controller";
import { StatModule } from "../stat/stat.module";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary
    ]),
    PexelsModule,
    StatModule
  ],
  controllers: [
    VocabularyController
  ],
  providers: [
    VocabularyService
  ],
  exports: [
    VocabularyService
  ]
})
export class VocabularyModule { }