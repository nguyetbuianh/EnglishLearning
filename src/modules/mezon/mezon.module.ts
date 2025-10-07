import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MezonService } from './mezon.service'; 
import { ToeicModule } from 'src/modules/toeic/toeic.module'; 
import { UserModule } from '../user/user.module';
@Module({
  imports: [ConfigModule, ToeicModule, UserModule],
  providers: [MezonService],
  exports: [MezonService],
})
export class MezonModule {}
