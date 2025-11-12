import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionOption } from '../../../entities/question-option.entity';
import { OptionEnum } from '../../../enum/option.enum';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionOptionService {
  constructor(
    @InjectRepository(QuestionOption)
    private readonly optionRepo: Repository<QuestionOption>,
  ) { }

  async getOption(questionId: number, correctOption: OptionEnum) {
    return await this.optionRepo.findOne({
      where: {
        question: { id: questionId },
        optionLabel: correctOption,
      },
    });
  }
}
