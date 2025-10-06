import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MezonService } from './mezon.service';

@Module({
  imports: [ConfigModule],
  providers: [MezonService],
  exports: [MezonService],
})
export class MezonModule {}
