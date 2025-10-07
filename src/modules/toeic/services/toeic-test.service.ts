import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicTest } from 'src/entities/toeic-test.entity';
import { UserProgress } from 'src/entities/user-progress.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ToeicTestService {
  constructor(
    @InjectRepository(ToeicTest)
    private readonly testRepo: Repository<ToeicTest>,
  ) {}

  // Fetch all existing tests
  async getAllTests(): Promise<ToeicTest[]> {
    return this.testRepo.find({ order: { id: 'ASC' } });
  }
}
