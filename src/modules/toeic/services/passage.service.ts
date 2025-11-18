import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Passage } from '../../../entities/passage.entity';

@Injectable()
export class PassageService {
  constructor(
    @InjectRepository(Passage)
    private readonly passageRepo: Repository<Passage>,
  ) { }

  async getPassageDetail(passageId: number) {
    const passage = await this.passageRepo.findOne({
      where: {
        id: passageId,
      },
    });
    return passage;
  }
  
  async savePassage(passage: Passage): Promise<Passage> {
    return this.passageRepo.save(passage)
  }
}
