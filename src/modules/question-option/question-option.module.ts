import { Module } from "@nestjs/common";
import { QuestionOptionService } from "./question-option.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuestionOption } from "src/entities/question-option.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionOption])
  ],
  providers: [
    QuestionOptionService
  ],
  exports: [
    QuestionOptionService
  ]
})
export class QuestionOptionModule { }