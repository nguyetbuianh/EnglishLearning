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
import { NextQuestionHandler } from './handlers/next-question.handler';

const commandHandlers = [
  WelcomeHandler,
  StartTestHandler,
  InitializationHandler,
  ToeicPartHandler,
  ToeicTestHandler,
  ConfirmStartTestHandler,
  SelectPartHandler,
  SelectTestHandler,
  NextQuestionHandler
];

@Module({
  imports: [
    UserModule,
    ToeicModule
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
