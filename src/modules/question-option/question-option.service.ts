import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuestionOption } from "../../entities/question-option.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuestionOptionService {
  constructor(
    @InjectRepository(QuestionOption)
    private readonly questionOptionRepo: Repository<QuestionOption>
  ) { }

  async saveQuestionOptions(options: QuestionOption): Promise<QuestionOption> {
    return this.questionOptionRepo.save(options);
  }
}