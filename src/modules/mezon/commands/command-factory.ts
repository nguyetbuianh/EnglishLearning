import { CommandHandler } from "./command-handler.interface";
import { WelcomeCommandHandler } from "./welcome.command";


export class CommandFactory {
  static getHandler(command: string): CommandHandler | null {
    switch (command) {
      case "welcome": return new WelcomeCommandHandler();
      default: return null;
    }
  }
}
