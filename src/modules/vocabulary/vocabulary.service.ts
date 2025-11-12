import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vocabulary } from "../../entities/vocabulary.entity";
import { Repository } from "typeorm";

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
      where: { topic: { id: topicId } },
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
    const count = await this.vocabularyRepo.count();
    if (count === 0) return null;

    const randomIndex = Math.floor(Math.random() * count);
    const randomWord = await this.vocabularyRepo
      .createQueryBuilder('v')
      .skip(randomIndex)
      .take(1)
      .getOne();

    return randomWord;
  }

  async getVocabByWord(word: string): Promise<Vocabulary | null> {
    return this.vocabularyRepo.findOne({
      where: { word: word }
    })
  }
}
