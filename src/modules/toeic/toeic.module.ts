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

@Module({
  imports: [TypeOrmModule.forFeature([
    ToeicPart,
    ToeicTest,
    Question,
    Passage
  ])],
  providers: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService
  ],
  exports: [
    ToeicPartService,
    ToeicTestService,
    ToeicQuestionService,
    PassageService
  ],
})
export class ToeicModule { }
