import { Module } from '@nestjs/common';
import { MezonModule } from './modules/mezon/mezon.module';
import { User } from 'mezon-sdk/dist/cjs/api/api';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/data-source';
import { ToeicModule } from './modules/toeic/toeic.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig as TypeOrmModuleOptions),
    MezonModule,
    UserModule,
    ToeicModule
  ],
})
export class AppModule { }
