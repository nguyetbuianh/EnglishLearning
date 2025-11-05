import { Module } from "@nestjs/common";
import { GoogleAIModule } from "../google-ai/google-ai.module";
import { ToeicImportService } from "./toeic-import.service";
import { ToeicModule } from "../toeic/toeic.module";

@Module({
  imports: [
    GoogleAIModule,
    ToeicModule
  ],
  providers: [
    ToeicImportService
  ],
  exports: [
    ToeicImportService
  ]
})
export class ToeicImportModule { }