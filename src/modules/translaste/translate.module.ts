import { Module } from "@nestjs/common";
import { TranslateService } from "./translate.service";
import { ImportWordService } from "./import-word.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { Topic } from "../../entities/topic.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary,
      Topic
    ])
  ],
  providers: [
    TranslateService,
    ImportWordService
  ],
  exports: [
    TranslateService,
    ImportWordService
  ],
})
export class TrasnlateModule { }