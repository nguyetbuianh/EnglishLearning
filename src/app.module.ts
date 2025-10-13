import { Module } from '@nestjs/common';
import { MezonModule } from './modules/mezon/mezon.module';

@Module({
  imports: [
    MezonModule,
  ],
})
export class AppModule { }
