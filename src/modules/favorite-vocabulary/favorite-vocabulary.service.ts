import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FavoriteVocabulary } from "src/entities/favorite-vocabulary.entity";
import { Repository } from "typeorm";

@Injectable()
export class FavoriteVocabularyService {
  constructor(
    @InjectRepository(FavoriteVocabulary)
    private readonly favoriteVocabularyRepo: Repository<FavoriteVocabulary>
  ) { }

  async saveVocabulary(favoriteVocabulary: FavoriteVocabulary): Promise<FavoriteVocabulary> {
    return await this.favoriteVocabularyRepo.save(favoriteVocabulary);
  }
}