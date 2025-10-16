import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToeicPart } from 'src/entities/toeic-part.entity';

@Injectable()
export class ToeicPartService {
  constructor(
    @InjectRepository(ToeicPart)
    private readonly partRepo: Repository<ToeicPart>,
  ) { }

  async getAllParts(): Promise<ToeicPart[]> {
    return this.partRepo.find({ order: { id: 'ASC' } });
  }
}
