import { ToeicService } from "src/modules/toeic/toeic.service";
import { AllTestCommandHandler } from "./all-test.command";
import { CommandHandler } from "./command-handler.interface";
import { WelcomeCommandHandler } from "./welcome.command";


export class CommandFactory {
  constructor(private toeicService: ToeicService) {}

  getHandler(command: string): CommandHandler | null {
    switch (command) {
      case "welcome": return new WelcomeCommandHandler();
      case "alltests": return new AllTestCommandHandler(this.toeicService);
      default: return null;
    }
  }
}
