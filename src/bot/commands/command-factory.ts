import { ToeicService } from "src/modules/toeic/toeic.service";
import { AllTestCommandHandler } from "./all-test.command";
import { CommandHandler } from "./command-handler.interface";
import { WelcomeCommandHandler } from "./welcome.command";
import { StartCommandHandler } from "./start.command"; 
import { UserService } from "src/modules/user/user.service";

export class CommandFactory {
  constructor(private readonly toeicService: ToeicService,
    private readonly userService: UserService
  ) {}

  getHandler(rawCommand: string): CommandHandler | null {
    if (!rawCommand) return null;

    const command = rawCommand.trim().replace(/^\*/, "").split(/\s+/)[0].toLowerCase();
    switch (command.toLowerCase()) {
      case "welcome":
        return new WelcomeCommandHandler();

      case "list_tests":
        return new AllTestCommandHandler(this.toeicService);

      case "start":
        return new StartCommandHandler(this.toeicService, this.userService);

      default:
        return null;
    }
  }
}

