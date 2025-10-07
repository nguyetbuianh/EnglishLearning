import {
  Controller,
  Inject,
  Get
} from "@nestjs/common";
import type { IVocabularyService } from "./interface/vocabulary-service.interface";

@Controller("vocabularies")
export class VocabularyController {
  constructor(
    @Inject("IVocabularyService")
    private readonly vocabularyService: IVocabularyService
  ) { }

  @Get()
  async findAllVocabulary() {
    return await this.vocabularyService.findAllVocabulary();
  }
}