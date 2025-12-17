import { Module } from '@nestjs/common';
import { MezonModule } from './modules/mezon/mezon.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/data-source';
import { ToeicModule } from './modules/toeic/toeic.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyModule } from './modules/daily/daily.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisCacheConfigService } from './config/redis-cache.config';
import { AuthJWTModule } from './auth/auth-jwt.module';
import { TopicModule } from './modules/topic-vocabulary/topic.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { StatModule } from './modules/stat/stat.module';
import { UserProcessModule } from './modules/user-process/user-process.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig as TypeOrmModuleOptions),
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      useClass: RedisCacheConfigService,
      isGlobal: true,
    }),
    MezonModule,
    UserModule,
    ToeicModule,
    DailyModule,
    AuthModule,
    TopicModule,
    JwtModule,
    AuthJWTModule,
    VocabularyModule,
    StatModule,
    UserProcessModule
  ]
})
export class AppModule { }
