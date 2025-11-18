import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
@Injectable()
export class ToeicQuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) { }

  private getCacheKey(testId: number, partId: number): string {
    return `test:${testId}:part:${partId}:questions`;
  }

  private sortOptions(question: Question) {
    if (question.options) {
      question.options.sort((a, b) => a.optionLabel.localeCompare(b.optionLabel));
    }
  }

  private async getCachedQuestions(testId: number, partId: number): Promise<Question[] | null> {
    const cacheKey = this.getCacheKey(testId, partId);
    const cachedQuestions = await this.cache.get<Question[]>(cacheKey);

    return cachedQuestions || null;
  }

  private async setCachedQuestions(testId: number, partId: number, questions: Question[]): Promise<void> {
    const cacheKey = this.getCacheKey(testId, partId);

    questions.forEach(q => this.sortOptions(q));

    await this.cache.set(cacheKey, questions, 86_400_000);
  }

  async getFirstQuestion(testId: number, partId: number, useCache: boolean = true): Promise<Question | null> {
    if (useCache) {
      const cachedQuestions = await this.getCachedQuestions(testId, partId);
      if (cachedQuestions && cachedQuestions.length > 0) {
        this.sortOptions(cachedQuestions[0]);
        return cachedQuestions[0];
      }
    }

    const questions = await this.questionRepo.find({
      where: {
        test: { id: testId },
        part: { id: partId },
      },
      relations: ['options', 'test', 'part', 'passage'],
      order: { id: 'ASC' },
    });

    if (!questions || questions.length === 0) return null;

    if (useCache) {
      await this.setCachedQuestions(testId, partId, questions);
    }

    return questions[0];
  }

  async getQuestion(testId: number, partId: number, questionNumber: number, useCache: boolean = true): Promise<Question | null> {
    if (useCache) {
      const cachedQuestions = await this.getCachedQuestions(testId, partId);
      const question = cachedQuestions?.find(q => q.questionNumber === questionNumber) || null;
      if (question) {
        this.sortOptions(question);
        return question;
      }
    }

    const question = await this.questionRepo.findOne({
      where: { test: { id: testId }, part: { id: partId }, questionNumber },
      relations: ["options", "test", "part", "passage"],
    });

    if (question) this.sortOptions(question);
    return question;
  }

  async getQuestionWithPassage(
    testId: number,
    partId: number,
    questionNumber: number,
    passageId?: number,
    useCache: boolean = true
  ): Promise<Question | null> {
    if (useCache) {
      const cachedQuestions = await this.getCachedQuestions(testId, partId);
      if (cachedQuestions) {
        const question = cachedQuestions?.find(q => q.questionNumber === questionNumber && q.passage?.id === passageId) || null;
        if (question) {
          this.sortOptions(question);
          return question;
        }
      }
    }

    const question = await this.questionRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        questionNumber: questionNumber,
        passage: { id: passageId }
      },
      relations: ["options", "passage", "test", "part"],
    });

    if (question) this.sortOptions(question);
    return question;
  }

  async getFirstQuestionByPassage(passageId: number): Promise<Question | null> {
    return this.questionRepo.findOne({
      where: {
        passage: { id: passageId },
      },
      relations: ['options', 'test', 'part', 'passage'],
      order: { id: 'ASC' },
    });
  }

  async findQuestionById(questionId: number): Promise<Question | null> {
    return await this.questionRepo.findOne({
      where: { id: questionId },
      relations: ['passage'],
    });
  }

  async getRandomQuestion(): Promise<Question | null> {
    const partIds = [5, 6, 7];

    const count = await this.questionRepo.count({
      where: { part: { id: In(partIds) } },
    });

    if (count === 0) return null;

    const randomOffset = Math.floor(Math.random() * count);

    const [question] = await this.questionRepo.find({
      where: { part: { id: In(partIds) } },
      relations: ['options', 'part', 'test', 'passage'],
      skip: randomOffset,
      take: 1,
    });

    return question || null;
  }

  async saveQuestion(question: Question): Promise<Question> {
    return this.questionRepo.save(question)
  }

  async updateQuestion(
    part: number,
    test: number,
    questionNumber: number,
    updateData: Partial<Question>,
  ): Promise<void> {
    await this.questionRepo.update(
      {
        part: { id: part },
        test: { id: test },
        questionNumber: questionNumber,
      },
      {
        explanation: updateData.explanation,
      },
    );
  }
}
