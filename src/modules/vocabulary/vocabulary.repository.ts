import { Vocabulary } from "src/entities/vocabulary.entity";
import { IVocabularyRepository } from "./interface/vocabulary-repository.interface";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

export class VocabularyRepository implements IVocabularyRepository {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly repository: Repository<Vocabulary>,
  ) { }
  async findAllVocabulary(): Promise<Vocabulary[]> {
    return await this.repository.find();
  }
}