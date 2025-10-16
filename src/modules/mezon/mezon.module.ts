import { Module } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { InteractionFactory } from './router/interaction-factory';
import { WelcomeCommandHandler } from './handlers/welcome.handler';
import { BaseHandler, InteractionEvent } from 'src/modules/mezon/handlers/base';
import { MezonClient } from 'mezon-sdk';
import { appConfig } from 'src/appConfig';
import { EventRouter } from './router/event.router';
import { UserModule } from '../user/user.module';
import { ToeicModule } from '../toeic/toeic.module';
import { StartTestCommandHandler } from './handlers/start-test.handler';

const commandHandlers = [
  WelcomeCommandHandler,
  StartTestCommandHandler
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
