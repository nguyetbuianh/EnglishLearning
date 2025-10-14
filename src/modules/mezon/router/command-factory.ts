import { CommandHandler } from "../utils/command-handler.abstract";
import { getCommandMetadata } from '../decorators/command.decorator';

export class CommandFactory {
  private readonly commandMap = new Map<string, CommandHandler>();

  constructor(handlers: CommandHandler[]) {
    for (const handler of handlers) {
      const commandName = getCommandMetadata(handler.constructor);
      if (commandName) {
        this.commandMap.set(commandName, handler);
      }
    }
  }

  getHandler(rawCommand: string): CommandHandler | null {
    if (!rawCommand) return null;
    return this.commandMap.get(rawCommand) ?? null;
  }
}