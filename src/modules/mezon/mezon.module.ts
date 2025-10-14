import { Module } from '@nestjs/common';
import { MezonService } from './mezon.service';
import { CommandFactory } from './router/command-factory';
import { CommandRouter } from './router/command.router';
import { WelcomeCommandHandler } from './commands/welcome.command';
import { CommandHandler } from 'src/modules/mezon/utils/command-handler.abstract'; // <-- đảm bảo đúng path

const commandHandlers = [WelcomeCommandHandler];

@Module({
  providers: [
    CommandRouter,
    MezonService,
    ...commandHandlers,
    {
      provide: CommandFactory,
      useFactory: (...handlers: CommandHandler[]): CommandFactory =>
        new CommandFactory(handlers),
      inject: [...commandHandlers],
    },
  ],
  exports: [MezonService],
})
export class MezonModule { }
