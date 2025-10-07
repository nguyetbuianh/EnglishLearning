import { Vocabulary } from "src/entities/vocabulary.entity";

export interface IVocabularyRepository {
  findAllVocabulary(): Promise<Vocabulary[]>;
}