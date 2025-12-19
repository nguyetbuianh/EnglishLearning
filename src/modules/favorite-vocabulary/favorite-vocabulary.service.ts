import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FavoriteVocabulary } from "../../entities/favorite-vocabulary.entity";
import { In, Repository } from "typeorm";
import { VocabularyService } from "../vocabulary/vocabulary.service";
import { FavVocabResponse } from "../../responses/vocab.response.";
import { plainToInstance } from "class-transformer";
import { PaginationResponse } from "../../responses/pagination.response";

@Injectable()
export class FavoriteVocabularyService {
  constructor(
    @InjectRepository(FavoriteVocabulary)
    private readonly favoriteVocabularyRepo: Repository<FavoriteVocabulary>,
    private readonly vocabService: VocabularyService
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
  ): Promise<PaginationResponse<FavVocabResponse>> {
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

    const totalPages = Math.ceil(total / limit);

    const vocabTransform = plainToInstance(
      FavVocabResponse,
      data,
      { excludeExtraneousValues: true }
    );

    return {
      data: vocabTransform,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
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

  async deleteVocab(vocabId: number, userId: number): Promise<void> {
    await this.favoriteVocabularyRepo.delete({
      user: { id: userId },
      vocabulary: { id: vocabId },
    });
  }

  async saveExistVocab(userId: number, vocabId: number): Promise<void> {
    const vocab = await this.vocabService.findVocabularyById(vocabId);
    if (!vocab) {
      throw new NotFoundException('Vocab not found');
    }

    const existed = await this.favoriteVocabularyRepo.findOne({
      where: {
        userId,
        vocabulary: { id: vocabId },
      },
    });
    if (existed) return;

    await this.favoriteVocabularyRepo.save(
      this.favoriteVocabularyRepo.create({
        userId,
        vocabulary: vocab,
      }),
    );
  }
}
