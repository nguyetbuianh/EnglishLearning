import { AllTestsCommandHandler } from "../commands/all-tests.command";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { WelcomeCommandHandler } from "../commands/welcome.command";
import { StartTestCommandHandler } from "../commands/start-test.command";
import { UserService } from "src/modules/user/user.service";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ContinueTestCommandHandler } from "../commands/continue-test.command";
import { RestartTestCommandHandler } from "../commands/restart-test.command";
import { UserPartResultService } from "src/modules/toeic/services/user-part-result.service";
import { AllPartsCommandHandler } from "../commands/all-parts.command";
import { ToeicPartService } from "src/modules/toeic/services/toeic-part.service";
import { NextQuestionCommandHandler } from "../commands/next-question.command";

export class CommandFactory {
  constructor(private toeicProgressService: ToeicProgressService,
    private userService: UserService,
    private toeicQuestionService: ToeicQuestionService,
    private toeicTestService: ToeicTestService,
    private userPartResultService: UserPartResultService,
    private toeicPartService: ToeicPartService
  ) { }

  getHandler(rawCommand: string): CommandHandler | null {
    if (!rawCommand) return null;

    const command = rawCommand.trim().replace(/^\*/, "").split(/\s+/)[0].toLowerCase();
    switch (command.toLowerCase()) {
      case "welcome":
        return new WelcomeCommandHandler();

      case "list_tests":
        return new AllTestsCommandHandler(this.toeicTestService);

      case "start":
        return new StartTestCommandHandler(
          this.toeicQuestionService,
          this.toeicProgressService,
          this.userService);

      case "continue":
        return new ContinueTestCommandHandler(
          this.toeicProgressService,
          this.toeicQuestionService);

      case "restart":
        return new RestartTestCommandHandler(
          this.toeicQuestionService,
          this.toeicProgressService,
          this.userService,
          this.userPartResultService);

      case "list_parts":
        return new AllPartsCommandHandler(this.toeicPartService);

      case "next_question":
        return new NextQuestionCommandHandler(
          this.toeicQuestionService,
          this.toeicProgressService,
          this.userService);

      default:
        return null;
    }
  }
}

