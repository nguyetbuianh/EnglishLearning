import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { In, IsNull, Not, Repository } from "typeorm";
import { GuessWordInterface, VerifyWordInterface } from "../../interfaces/guess-word.interface";
import { PaginationResponse } from "../../responses/pagination.response";
import { PexelsService } from "../pexels/pexels.service";
import { maskWord } from "../../utils/guess-word.util";
import { StatService } from "../stat/stat.service";
import { VerifyWordResponse } from "../../responses/guess-word.response";
import { PaginationInterface } from "../../interfaces/pagination.interface";
import { FlashcardResponse } from "../../responses/flashcard.response";


@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepo: Repository<Vocabulary>,
    private readonly pexelsService: PexelsService,
    private readonly statService: StatService
  ) { }

  async getVocabulariesByTopic(
    topicId: number,
    page: number,
    limit: number
  ): Promise<PaginationResponse<Vocabulary>> {

    const [data, total] = await this.vocabularyRepo.findAndCount({
      where: {
        topic: { id: topicId },
        isActive: true
      },
      order: { createdAt: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findVocabularyById(vocabularyId: number): Promise<Vocabulary | null> {
    return this.vocabularyRepo.findOne({
      where: { id: vocabularyId }
    });
  }

  async getRandomVocabulary(): Promise<Vocabulary | null> {
    const vocabularies = await this.vocabularyRepo.find({
      where: { isActive: true },
    });

    if (vocabularies.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * vocabularies.length);
    return vocabularies[randomIndex];
  }

  async getVocabByWord(word: string): Promise<Vocabulary | null> {
    return this.vocabularyRepo.findOne({
      where: { word: word }
    })
  }

  async createVocab(vocab: Partial<Vocabulary>): Promise<Vocabulary> {
    return this.vocabularyRepo.save(vocab)
  }

  async getVocabularyOfUser(
    userId: number,
    pagination: PaginationInterface
  ): Promise<PaginationResponse<FlashcardResponse>> {

    const [items, total] = await this.vocabularyRepo.findAndCount({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    const totalPages = Math.ceil(total / pagination.limit);


    return {
      data: items,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: totalPages
      }
    };
  }

  async deleteVocabularyOfUser(vocabIds: number[], userId: number): Promise<void> {
    await this.vocabularyRepo.delete({
      id: In(vocabIds),
      user: { id: userId }
    });
  }

  async getUserDictionary(
    page: number,
    limit: number
  ): Promise<{ data: Vocabulary[]; total: number }> {
    const [data, total] = await this.vocabularyRepo.findAndCount({
      where: {
        user: Not(IsNull()),
        isActive: false
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async updateActiveVocab(vocabIds: number[]) {
    const vocabs = await this.vocabularyRepo.find({
      where: { id: In(vocabIds) },
    });

    if (vocabs.length === 0) {
      throw new Error(`No vocabulary found for ids: ${vocabIds}`);
    }

    vocabs.forEach(v => v.isActive = true);

    return this.vocabularyRepo.save(vocabs);
  }

  async deleteVocab(vocabIds: number[]): Promise<void> {
    await this.vocabularyRepo.delete({
      id: In(vocabIds)
    });
  }

  async getWordAndImage(): Promise<GuessWordInterface> {
    const vocab = await this.getRandomVocabulary();
    if (!vocab) throw new Error("No vocabulary found");

    const imageUrl = await this.pexelsService.getImage(vocab);

    const maskedWord = maskWord(vocab.word);
    return {
      vocabId: vocab.id,
      imageUrl,
      maskedWord
    }
  }

  async guessWordVerify(verifyWord: VerifyWordInterface): Promise<VerifyWordResponse> {
    const { vocabId, wordGuessed, userId } = verifyWord;

    const vocab = await this.findVocabularyById(vocabId);
    if (!vocab) {
      throw new NotFoundException('Vocabulary not found');
    }

    const isCorrect = vocab.word.trim().toLowerCase() ===
      wordGuessed.trim().toLowerCase();

    await this.statService.updateUserStats(userId, isCorrect);

    return {
      word: vocab.word,
      isCorrect
    }
  }
}
