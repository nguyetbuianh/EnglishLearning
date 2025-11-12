import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicPart } from '../../../entities/toeic-part.entity';

@Injectable()
export class ToeicPartService {
  constructor(
    @InjectRepository(ToeicPart)
    private readonly partRepo: Repository<ToeicPart>,
  ) { }

  async getAllParts(): Promise<ToeicPart[]> {
    return this.partRepo.find({ order: { id: 'ASC' } });
  }

  async findPartById(partId: number): Promise<ToeicPart | null> {
    return await this.partRepo.findOne({
      where: { id: partId }
    });
  }
}
