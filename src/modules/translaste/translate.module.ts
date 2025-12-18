import { Module } from "@nestjs/common";
import { TranslateService } from "./translate.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { Topic } from "../../entities/topic.entity";
import { TranslateController } from "./translate.controller";
import { VocabularyModule } from "../vocabulary/vocabulary.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary,
      Topic
    ]),
    VocabularyModule
  ],
  providers: [
    TranslateService
  ],
  controllers: [
    TranslateController
  ],
  exports: [
    TranslateService
  ],
})
export class TrasnlateModule { }