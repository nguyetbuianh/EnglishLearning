import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPartResult } from 'src/entities/user-test-result.entity';

@Injectable()
export class UserPartResultService {
  constructor(
    @InjectRepository(UserPartResult)
    private readonly userPartResultRepo: Repository<UserPartResult>,
  ) { }

  async deletePartResult(userId: number, testId: number, partId: number) {
    await this.userPartResultRepo
      .createQueryBuilder()
      .delete()
      .from(UserPartResult)
      .where('user_id = :userId', { userId })
      .andWhere('test_id = :testId', { testId })
      .andWhere('part_id = :partId', { partId })
      .execute();
  }
}
