import { CommandHandler } from "../interfaces/command-handler.abstract";
import { COMMAND_METADATA, getCommandMetadata } from '../decorators/command.decorator';

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

    const command = rawCommand.trim().replace(/^\*/, '').split(/\s+/)[0].toLowerCase();
    return this.commandMap.get(command) ?? null;
  }
}