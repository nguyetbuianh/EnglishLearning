import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MezonModule } from './modules/mezon/mezon.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MezonModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule { }
