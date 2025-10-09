import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../entities/question.entity';
import { ToeicPart } from '../../entities/toeic-part.entity';
import { Passage } from '../../entities/passage.entity';
import { ToeicTest } from '../../entities/toeic-test.entity';
import { UserProgress } from 'src/entities/user-progress.entity';
import { User } from 'src/entities/user.entity';
import { UserModule } from '../user/user.module';
import { ToeicProgressService } from './services/toeic-progress.service';
import { ToeicPartService } from './services/toeic-part.service';
import { ToeicQuestionService } from './services/toeic-question.service';
import { ToeicTestService } from './services/toeic-test.service';
import { UserPartResult } from 'src/entities/user-test-result.entity';
import { UserPartResultService } from './services/user-part-result.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, ToeicPart, Passage, ToeicTest, UserProgress, User, UserPartResult]),
    UserModule
  ],
  providers: [
    ToeicPartService,
    ToeicProgressService,
    ToeicQuestionService,
    ToeicTestService,
    UserPartResultService
  ],
  exports: [
    ToeicPartService,
    ToeicProgressService,
    ToeicQuestionService,
    ToeicTestService,
    UserPartResultService
  ],
})
export class ToeicModule { }
