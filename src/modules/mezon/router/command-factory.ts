import { AllTestCommandHandler } from "../commands/all-test.command";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { WelcomeCommandHandler } from "../commands/welcome.command";
import { StartCommandHandler } from "../commands/start.command"; 
import { UserService } from "src/modules/user/user.service";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";

export class CommandFactory {
  constructor(private toeicProgressService: ToeicProgressService,
    private userService: UserService,
    private toeicQuestionService: ToeicQuestionService,
    private toeicTestService: ToeicTestService
  ) {}

  getHandler(rawCommand: string): CommandHandler | null {
    if (!rawCommand) return null;

    const command = rawCommand.trim().replace(/^\*/, "").split(/\s+/)[0].toLowerCase();
    switch (command.toLowerCase()) {
      case "welcome":
        return new WelcomeCommandHandler();

      case "list_tests":
        return new AllTestCommandHandler(this.toeicTestService);

      case "start":
        return new StartCommandHandler(this.toeicQuestionService, this.toeicProgressService, this.userService);

      default:
        return null;
    }
  }
}

