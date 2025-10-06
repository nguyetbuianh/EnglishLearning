import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToeicService } from './toeic.service';
import { ToeicController } from './toeic.controller';
import { Question } from '../../entities/question.entity';
import { ToeicPart } from '../../entities/toeic-part.entity';
import { Passage } from '../../entities/passage.entity';
import { ToeicTest } from '../../entities/toeic-test.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, ToeicPart, Passage, ToeicTest])
  ],
  providers: [ToeicService],
  controllers: [ToeicController],
  exports: [ToeicService]
})
export class ToeicModule {}
