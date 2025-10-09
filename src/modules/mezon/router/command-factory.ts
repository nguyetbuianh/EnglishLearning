import { Injectable } from "@nestjs/common";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { AllTestsCommandHandler } from "../commands/all-tests.command";
import { WelcomeCommandHandler } from "../commands/welcome.command";
import { ContinueTestCommandHandler } from "../commands/continue-test.command";
import { RestartTestCommandHandler } from "../commands/restart-test.command";
import { AllPartsCommandHandler } from "../commands/all-parts.command";
import { NextQuestionCommandHandler } from "../commands/next-question.command";
import { ConfirmStartTestCommandHandler } from "../commands/confirm-start-test.command";
import { StartTestCommandHandler } from "../commands/start-test.command";

@Injectable()
export class CommandFactory {
  constructor(
    private readonly welcomeCommandHandler: WelcomeCommandHandler,
    private readonly allTestsCommandHandler: AllTestsCommandHandler,
    private readonly confirmStartTestCommandHandler: ConfirmStartTestCommandHandler,
    private readonly continueTestCommandHandler: ContinueTestCommandHandler,
    private readonly restartTestCommandHandler: RestartTestCommandHandler,
    private readonly allPartsCommandHandler: AllPartsCommandHandler,
    private readonly nextQuestionCommandHandler: NextQuestionCommandHandler,
    private readonly startTestCommandHandler: StartTestCommandHandler
  ) { }

  getHandler(rawCommand: string): CommandHandler | null {
    if (!rawCommand) return null;

    const command = rawCommand.trim().replace(/^\*/, "").split(/\s+/)[0].toLowerCase();

    switch (command) {
      case "welcome":
        return this.welcomeCommandHandler;
      case "list_tests":
        return this.allTestsCommandHandler;
      case "confirm_start":
        return this.confirmStartTestCommandHandler;
      case "continue":
        return this.continueTestCommandHandler;
      case "restart":
        return this.restartTestCommandHandler;
      case "list_parts":
        return this.allPartsCommandHandler;
      case "next_question":
        return this.nextQuestionCommandHandler;
      case "start":
        return this.startTestCommandHandler;
      default:
        return null;
    }
  }
}
