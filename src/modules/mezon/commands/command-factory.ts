import { CommandHandler } from "./command-handler.interface";
import { WelcomeCommandHandler } from "./welcome.command";

export class CommandFactory {
  static getHandler(command: string): CommandHandler | null {
    if (command === "welcome" || command === "help") {
      return new WelcomeCommandHandler();
    }
    return null;
  }
}
