import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MezonService } from './mezon.service';
import { ToeicModule } from 'src/modules/toeic/toeic.module';
import { UserModule } from '../user/user.module';
import { CommandFactory } from './router/command-factory';
import { CommandRouter } from './router/command.router';
import { AllPartsCommandHandler } from './commands/all-parts.command';
import { AllTestsCommandHandler } from './commands/all-tests.command';
import { ConfirmStartTestCommandHandler } from './commands/confirm-start-test.command';
import { ContinueTestCommandHandler } from './commands/continue-test.command';
import { NextQuestionCommandHandler } from './commands/next-question.command';
import { RestartTestCommandHandler } from './commands/restart-test.command';
import { StartTestCommandHandler } from './commands/start-test.command';
import { WelcomeCommandHandler } from './commands/welcome.command';
@Module({
  imports: [ConfigModule, ToeicModule, UserModule],
  providers: [
    CommandFactory,
    CommandRouter,
    MezonService,
    AllPartsCommandHandler,
    AllTestsCommandHandler,
    ConfirmStartTestCommandHandler,
    ContinueTestCommandHandler,
    NextQuestionCommandHandler,
    RestartTestCommandHandler,
    StartTestCommandHandler,
    WelcomeCommandHandler
  ],
  exports: [MezonService],
})
export class MezonModule { }
