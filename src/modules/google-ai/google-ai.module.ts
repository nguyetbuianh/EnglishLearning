import { Module } from "@nestjs/common";
import { GoogleAIService } from "./google-ai.service";

@Module({
  imports: [

  ],
  providers: [
    GoogleAIService
  ],
  exports: [
    GoogleAIService
  ]
})
export class GoogleAIModule { }