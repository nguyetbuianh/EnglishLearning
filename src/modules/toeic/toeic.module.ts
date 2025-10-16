import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToeicPart } from 'src/entities/toeic-part.entity';
import { ToeicTest } from 'src/entities/toeic-test.entity';
import { User } from 'src/entities/user.entity';
import { ToeicPartService } from './services/toeic-part.service';
import { ToeicTestService } from './services/toeic-test.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    ToeicPart,
    ToeicTest
  ])],
  providers: [
    ToeicPartService,
    ToeicTestService
  ],
  exports: [
    ToeicPartService,
    ToeicTestService
  ],
})
export class ToeicModule { }
