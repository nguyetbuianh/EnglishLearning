import { Module } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { InteractionFactory } from './router/interaction-factory';
import { CommandRouter } from './router/command.router';
import { WelcomeCommandHandler } from './commands/welcome.command';
import { BaseHandler } from './commands/base';

const commandHandlers = [WelcomeCommandHandler];

@Module({
  providers: [
    CommandRouter,
    MezonService,
    ...commandHandlers,
    {
      provide: InteractionFactory,
      useFactory: (...handlers: BaseHandler[]): InteractionFactory =>
        new InteractionFactory(handlers),
      inject: [...commandHandlers],
    },
  ],
  exports: [MezonService],
})
export class MezonModule { }
