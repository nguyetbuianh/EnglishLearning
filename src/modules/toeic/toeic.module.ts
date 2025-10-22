import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToeicPart } from 'src/entities/toeic-part.entity';
import { ToeicTest } from 'src/entities/toeic-test.entity';
import { ToeicPartService } from './services/toeic-part.service';
import { ToeicTestService } from './services/toeic-test.service';
import { ToeicQuestionService } from './services/toeic-question.service';
import { Question } from 'src/entities/question.entity';
import { PassageService } from './services/passage.service';
import { Passage } from 'src/entities/passage.entity';
import { UserAnswerService } from './services/user-answer.service';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { User } from 'mezon-sdk/dist/cjs/api/api';
import { UserProgress } from 'src/entities/progress.entity';
import { UserProgressService } from './services/user-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    ToeicPart,
    ToeicTest,
    Question,
    Passage,
    UserAnswer,
    UserProgress
  ])],
  providers: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService,
    UserAnswerService,
    UserProgressService
  ],
  exports: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService,
    UserAnswerService,
    UserProgressService
  ],
})
export class ToeicModule { }
