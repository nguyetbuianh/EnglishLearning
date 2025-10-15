import { Module } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { InteractionFactory } from './router/interaction-factory';
import { WelcomeCommandHandler } from './commands/welcome.command';
import { BaseHandler, InteractionEvent } from 'src/modules/mezon/commands/base';
import { MezonClient } from 'mezon-sdk';
import { appConfig } from 'src/config';
import { EventRouter } from './router/event.router';

const commandHandlers = [
  WelcomeCommandHandler,
];

@Module({
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
