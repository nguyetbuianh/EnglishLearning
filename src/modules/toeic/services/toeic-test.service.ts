import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicTest } from '../../../entities/toeic-test.entity';
import { PaginationDto } from '../../../dtos/pagination.dto';
import { PaginationInterface, PaginationResponse } from '../../../interfaces/pagination.interface';
import { UserInterface } from '../../../interfaces/user.interface';
import { TestPaginationResponseResponse } from '../../../responses/user-progress.response';
import { UserProgressService } from './user-progress.service';

@Injectable()
export class ToeicTestService {
  constructor(
    @InjectRepository(ToeicTest)
    private readonly testRepo: Repository<ToeicTest>,
    private readonly userProgressService: UserProgressService
  ) { }

  async getAllTests(): Promise<ToeicTest[]> {
    return this.testRepo.find({ order: { id: 'ASC' } });
  }

  async findTestById(testId: number): Promise<ToeicTest | null> {
    return await this.testRepo.findOne({
      where: { id: testId }
    });
  }

  async getAllTestsPagination(
    params: PaginationDto
  ): Promise<PaginationResponse<ToeicTest>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await this.testRepo.findAndCount({
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findAllTestsWithProgress(
    query: PaginationInterface,
    user: UserInterface,
  ): Promise<TestPaginationResponseResponse> {
    const { items, pagination } =
      await this.getAllTestsPagination(query);

    const progressMap =
      await this.userProgressService.getTestWithProgress(user);

    const itemsWithProgress = items.map(test => ({
      ...test,
      partsProcess: progressMap.get(test.id) ?? null,
    }));

    return {
      items: itemsWithProgress,
      pagination,
    };
  }

  async getValidatedTest(testId: number) {
    const test = await this.findTestById(testId);
    if (!test) throw new NotFoundException("Test not found");
    return test;
  }
}