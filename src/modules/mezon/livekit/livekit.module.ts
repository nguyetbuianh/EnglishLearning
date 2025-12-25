import { Module } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    UserModule
  ],
  controllers: [LivekitController],
  providers: [LivekitService],
})
export class LivekitModule { }
