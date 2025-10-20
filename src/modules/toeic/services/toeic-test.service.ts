import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicTest } from 'src/entities/toeic-test.entity';

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
}
