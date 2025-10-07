import type { IVocabularyService } from "./interface/vocabulary-service.interface";
import { Inject } from "@nestjs/common";
import type { IVocabularyRepository } from "./interface/vocabulary-repository.interface";
import { VocabularyResponse } from "./response/voccabulary.response";

export class VocabularyService implements IVocabularyService {
  constructor(
    @Inject("IVocabularyRepository")
    private readonly vocabularyRepository: IVocabularyRepository,
  ) { }
  findAllVocabulary(): Promise<VocabularyResponse[]> {
    return this.vocabularyRepository.findAllVocabulary();
  }
}