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
import { TestsController } from './controllers/tests.controller';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { VocabsController } from './controllers/vocabs.controller';
import { TopicModule } from './modules/topic-vocabulary/topic.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt.guard';
import { ToeicTestPracticeService } from './services/toeic-test-practice.service';
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
    TopicModule
  ],
  controllers: [
    TestsController,
    UsersController,
    VocabsController
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    ToeicTestPracticeService
  ]
})
export class AppModule { }
