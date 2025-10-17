import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicPart } from 'src/entities/toeic-part.entity';
import { Passage } from 'src/entities/passage.entity';

@Injectable()
export class PassageService {
  constructor(
    @InjectRepository(Passage)
    private readonly passageRepo: Repository<Passage>,
  ) { }

  async getPassageDetail(testId: number, partId: number, passageNumber: number) {
    const passage = await this.passageRepo.findOne({
      where: {
        test: { id: testId },
        part: { id: partId },
        passageNumber: passageNumber,
      },
    });

    if (!passage) {
      throw new NotFoundException(
        `Passage not found.`,
      );
    }

    return passage;
  }
}
