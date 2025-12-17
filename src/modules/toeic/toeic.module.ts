import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToeicPartService } from './services/toeic-part.service';
import { ToeicTestService } from './services/toeic-test.service';
import { ToeicQuestionService } from './services/toeic-question.service';
import { PassageService } from './services/passage.service';
import { UserAnswerService } from './services/user-answer.service';
import { UserProgressService } from './services/user-progress.service';
import { QuestionOptionService } from './services/question-option.service';
import { ToeicPart } from '../../entities/toeic-part.entity';
import { ToeicTest } from '../../entities/toeic-test.entity';
import { Question } from '../../entities/question.entity';
import { Passage } from '../../entities/passage.entity';
import { UserAnswer } from '../../entities/user-answer.entity';
import { UserProgress } from '../../entities/progress.entity';
import { QuestionOption } from '../../entities/question-option.entity';
import { UserModule } from '../user/user.module';
import { ToeicController } from './toeic.controller';
import { StatService } from '../stat/stat.service';
import { UserStats } from '../../entities/user-stat.entity';
import { StatModule } from '../stat/stat.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    ToeicPart,
    ToeicTest,
    Question,
    Passage,
    UserAnswer,
    UserProgress,
    QuestionOption,
    UserStats
  ]),
    UserModule,
    StatModule
  ],
  controllers: [
    ToeicController
  ],
  providers: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService,
    UserAnswerService,
    UserProgressService,
    QuestionOptionService,
    StatService
  ],
  exports: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService,
    UserAnswerService,
    UserProgressService,
    QuestionOptionService,
    StatService
  ],
})
export class ToeicModule { }
