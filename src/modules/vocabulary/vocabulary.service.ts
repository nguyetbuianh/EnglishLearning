import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { In, IsNull, Not, Repository } from "typeorm";

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepo: Repository<Vocabulary>
  ) { }

  async getVocabulariesByTopic(
    topicId: number,
    page: number,
    limit: number
  ): Promise<{ data: Vocabulary[]; total: number }> {

    const [data, total] = await this.vocabularyRepo.findAndCount({
      where: {
        topic: { id: topicId },
        isActive: true
      },
      order: { createdAt: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
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

  async createVocab(vocab: Partial<Vocabulary>): Promise<Vocabulary | null> {
    return this.vocabularyRepo.save(vocab)
  }

  async getVocabularyOfUser(
    userId: number,
    page: number,
    limit: number
  ): Promise<{ data: Vocabulary[]; total: number }> {
    const [data, total] = await this.vocabularyRepo.findAndCount({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
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
}
