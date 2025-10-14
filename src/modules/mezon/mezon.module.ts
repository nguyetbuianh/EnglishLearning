import { Module, OnModuleInit } from '@nestjs/common';
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
import { CommandHandler } from './interfaces/command-handler.interface';
import { StartTestButtonHandler } from './interactions/buttons/start-test-button.handler';
import { AllTopicCommandHandler } from './commands/all-topic.command';
import { TopicService } from '../topic/topic.service';
import { TopicModule } from '../topic/topic.module';

const commandHandlers = [
  AllTopicCommandHandler,
  AllPartsCommandHandler,
  AllTestsCommandHandler,
  ConfirmStartTestCommandHandler,
  ContinueTestCommandHandler,
  NextQuestionCommandHandler,
  RestartTestCommandHandler,
  StartTestCommandHandler,
  WelcomeCommandHandler,

];

@Module({
  imports: [
    ConfigModule,
    ToeicModule,
    UserModule,
    TopicModule
  ],
  providers: [
    CommandRouter,
    MezonService,
    StartTestButtonHandler,
    ...commandHandlers,
    {
      provide: CommandFactory,
      useFactory: (...handlers: CommandHandler[]) => new CommandFactory(handlers),
      inject: [...commandHandlers],
    },

  ],
  exports: [MezonService],
})

export class MezonModule { }
