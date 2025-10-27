import { Module } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { InteractionFactory } from './router/interaction-factory';
import { WelcomeHandler } from './handlers/welcome.handler';
import { BaseHandler, InteractionEvent } from 'src/modules/mezon/handlers/base';
import { MezonClient } from 'mezon-sdk';
import { appConfig } from 'src/appConfig';
import { EventRouter } from './router/event.router';
import { InitializationHandler } from './handlers/initialization.handler';
import { UserModule } from '../user/user.module';
import { ToeicModule } from '../toeic/toeic.module';
import { StartTestHandler } from './handlers/start-test.handler';
import { ToeicPartHandler } from './handlers/toeic-part.handler';
import { ToeicTestHandler } from './handlers/toeic-test.handler';
import { ConfirmStartTestHandler } from './handlers/confirm-start-test.handler';
import { SelectPartHandler } from './handlers/select-part.handler';
import { SelectTestHandler } from './handlers/select-test.handler';
import { UserAnswerHandler } from './handlers/user-answer.handler';
import { NextQuestionHandler } from './handlers/next-question.handler';
import { CancelTestHandler } from './handlers/cancel-test.handler';
import { TopicModule } from '../topic-vocabulary/topic.module';
import { AllTopicHandler } from './handlers/all-topic.handler';
import { ShowVocabularyHandler } from './handlers/vocabulary-of-topic.handler';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { ContinueTestHandler } from './handlers/continue-test.handler';
import { RestartTestHandler } from './handlers/restart-test.handler';
import { HelpHandler } from './handlers/help.handler';
import { NextPartHandler } from './handlers/next-part.handler';
import { ReviewTestHandler } from './handlers/review-test.handler';
import { DailyReminderTask } from './handlers/reminder.handler';
import { DailyModule } from '../daily/daily.module';

const commandHandlers = [
  WelcomeHandler,
  StartTestHandler,
  InitializationHandler,
  ToeicPartHandler,
  ToeicTestHandler,
  ConfirmStartTestHandler,
  SelectPartHandler,
  SelectTestHandler,
  UserAnswerHandler,
  NextQuestionHandler,
  CancelTestHandler,
  AllTopicHandler,
  ShowVocabularyHandler,
  ContinueTestHandler,
  RestartTestHandler,
  HelpHandler,
  NextPartHandler,
  ReviewTestHandler,
  DailyReminderTask
];

@Module({
  imports: [
    UserModule,
    ToeicModule,
    TopicModule,
    VocabularyModule,
    DailyModule
  ],
  providers: [
    MezonService,
    EventRouter,
    ...commandHandlers,
    {
      provide: MezonClient,
      useFactory: async () => {
        const client = new MezonClient({
          botId: appConfig.bot.id,
          token: appConfig.bot.token,
        });
        await client.login();
        return client;
      },
    },
    {
      provide: InteractionFactory,
      useFactory: (...handlers: BaseHandler<InteractionEvent>[]): InteractionFactory =>
        new InteractionFactory(handlers),
      inject: [...commandHandlers],
    },

  ],
  exports: [MezonService],
})
export class MezonModule { }
