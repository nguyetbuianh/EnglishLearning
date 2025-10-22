import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vocabulary } from "src/entities/vocabulary.entity";
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
}
