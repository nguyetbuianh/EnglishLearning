import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './bot.service'; 
import { ToeicModule } from 'src/modules/toeic/toeic.module'; 
@Module({
  imports: [ConfigModule, ToeicModule],
  providers: [BotService],
  exports: [BotService],
})
export class MezonModule {}
