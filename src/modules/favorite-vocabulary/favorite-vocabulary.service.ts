import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FavoriteVocabulary } from "../../entities/favorite-vocabulary.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class FavoriteVocabularyService {
  constructor(
    @InjectRepository(FavoriteVocabulary)
    private readonly favoriteVocabularyRepo: Repository<FavoriteVocabulary>
  ) { }

  async saveVocabulary(favoriteVocabulary: Partial<FavoriteVocabulary>): Promise<void> {
    await this.favoriteVocabularyRepo.save(favoriteVocabulary);
  }

  async existingVocabularyAndUserId(
    userId: number,
    vocabularyId: number
  ): Promise<boolean> {
    return await this.favoriteVocabularyRepo.exists({
      where: {
        user: { id: userId },
        vocabulary: { id: vocabularyId }
      },
    });
  }

  async getVocabularyOfUser(
    userId: number,
    page: number,
    limit: number
  ): Promise<{ data: FavoriteVocabulary[]; total: number }> {
    const [data, total] = await this.favoriteVocabularyRepo.findAndCount({
      where: {
        user: { id: userId },
      },
      relations: ['vocabulary'],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getVocabulary(
    userId: number
  ): Promise<{ data: FavoriteVocabulary[] }> {
    const [data] = await this.favoriteVocabularyRepo.findAndCount({
      where: {
        user: { id: userId },
      },
      relations: ['vocabulary'],
      order: {
        createdAt: 'DESC',
      }
    });

    return { data };
  }

  async deleteVocabularyOfUser(vocabIds: number[], userId: number): Promise<void> {
    await this.favoriteVocabularyRepo.delete({
      user: { id: userId },
      vocabulary: { id: In(vocabIds) },
    });
  }
}
