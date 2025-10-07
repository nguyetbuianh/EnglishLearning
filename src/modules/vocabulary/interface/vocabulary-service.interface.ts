import { VocabularyResponse } from "../response/voccabulary.response";

export interface IVocabularyService {
  findAllVocabulary(): Promise<VocabularyResponse[]>;
}