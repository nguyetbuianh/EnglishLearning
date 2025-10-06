import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MezonService } from './mezon.service';
import { ToeicModule } from '../toeic/toeic.module';

@Module({
  imports: [ConfigModule, ToeicModule],
  providers: [MezonService],
  exports: [MezonService],
})
export class MezonModule {}
