import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserAnswer } from "src/entities/user-answer.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepo: Repository<UserAnswer>
  ) { }

  async recordAnswer(userAnswer: UserAnswer): Promise<UserAnswer> {
    return this.userAnswerRepo.save(userAnswer);
  }
}