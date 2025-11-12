import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DailyPracticeAnswer } from "../../../entities/daily-practice-answer.entity";
import { Question } from "../../../entities/question.entity";
import { User } from "../../../entities/user.entity";
import { OptionEnum } from "../../../enum/option.enum";
import { Repository } from "typeorm";

@Injectable()
export class DailyAnswerService {
  constructor(
    @InjectRepository(DailyPracticeAnswer)
    private readonly dailyAnswerRepo: Repository<DailyPracticeAnswer>,
  ) { }

  async saveDailyAnswer({
    user,
    question,
    chosenOption,
    isCorrect,
  }: {
    user: User;
    question: Question;
    chosenOption: OptionEnum;
    isCorrect: boolean;
  }): Promise<void> {
    const answer = this.dailyAnswerRepo.create({
      user,
      question,
      chosenOption,
      isCorrect,
    });

    await this.dailyAnswerRepo.upsert(answer, ['user', 'question']);
  }
}
