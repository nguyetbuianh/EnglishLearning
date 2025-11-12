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

@Module({
  imports: [TypeOrmModule.forFeature([
    ToeicPart,
    ToeicTest,
    Question,
    Passage,
    UserAnswer,
    UserProgress,
    QuestionOption
  ])],
  providers: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService,
    UserAnswerService,
    UserProgressService,
    QuestionOptionService
  ],
  exports: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService,
    UserAnswerService,
    UserProgressService,
    QuestionOptionService
  ],
})
export class ToeicModule { }
