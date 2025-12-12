import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicTest } from '../../../entities/toeic-test.entity';
import { PaginationDto } from '../../../dtos/pagination.dto';
import { PaginationResponse } from '../../../interfaces/pagination.interface';

@Injectable()
export class ToeicTestService {
  constructor(
    @InjectRepository(ToeicTest)
    private readonly testRepo: Repository<ToeicTest>,
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
}