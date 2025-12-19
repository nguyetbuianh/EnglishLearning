import { Module } from '@nestjs/common';
import { PexelsService } from '../pexels/pexels.service';

@Module({
  providers: [
    PexelsService
  ],
  exports: [
    PexelsService
  ],
})
export class PexelsModule { }
