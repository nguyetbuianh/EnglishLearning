import { Module } from "@nestjs/common";
import { GoogleAIModule } from "../google-ai/google-ai.module";
import { ToeicImportService } from "./toeic-import.service";
import { ToeicModule } from "../toeic/toeic.module";
import { QuestionOptionModule } from "../question-option/question-option.module";

@Module({
  imports: [
    GoogleAIModule,
    ToeicModule,
    QuestionOptionModule
  ],
  providers: [
    ToeicImportService
  ],
  exports: [
    ToeicImportService
  ]
})
export class ToeicImportModule { }