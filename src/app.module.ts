import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config'; 
import { MezonModule } from './modules/mezon/mezon.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig as TypeOrmModuleOptions),
    MezonModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
