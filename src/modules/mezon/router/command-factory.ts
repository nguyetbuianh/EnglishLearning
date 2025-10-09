import { AllTestsCommandHandler } from "../commands/all-tests.command";
import { CommandHandler } from "../interfaces/command-handler.interface";
import { WelcomeCommandHandler } from "../commands/welcome.command";
import { StartTestCommandHandler } from "../commands/start-test.command";
import { UserService } from "src/modules/user/user.service";
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { ContinueTestCommandHandler } from "../commands/continue-test.command";
import { TopicVocabularyService } from "src/modules/topic-vocabulary/topic-vocabulary.service";
import { AllTopicsCommand } from "../commands/all-topics.command";

export class CommandFactory {
  constructor(
    private toeicProgressService: ToeicProgressService,
    private userService: UserService,
    private toeicQuestionService: ToeicQuestionService,
    private toeicTestService: ToeicTestService,
    private topicVocabularyService: TopicVocabularyService
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
        return new ContinueTestCommandHandler(this.toeicProgressService, this.toeicQuestionService);

      case "topic":
        return new AllTopicsCommand(this.topicVocabularyService);

      default:
        return null;
    }
  }
}

