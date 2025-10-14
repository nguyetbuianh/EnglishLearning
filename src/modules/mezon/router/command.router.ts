import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../utils/parse-markdown";
import { CommandFactory } from "./command-factory";
<<<<<<< HEAD
import { handleBotError } from "../utils/error-handler";
import { Injectable } from "@nestjs/common";
=======
import { ToeicTestService } from "src/modules/toeic/services/toeic-test.service";
import { UserService } from "src/modules/user/user.service";
import { ToeicQuestionService } from "src/modules/toeic/services/toeic-question.service";
import { ToeicProgressService } from "src/modules/toeic/services/toeic-progress.service";
import { TopicVocabularyService } from "src/modules/topic-vocabulary/topic-vocabulary.service";
>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d

@Injectable()
export class CommandRouter {
<<<<<<< HEAD
  constructor(private commandFactory: CommandFactory) { }
=======
  private commandFactory: CommandFactory;

  constructor(
    private toeicProgressService: ToeicProgressService,
    private userService: UserService,
    private toeicQuestionService: ToeicQuestionService,
    private toeicTestService: ToeicTestService,
    //private topicVocabularyService: TopicVocabularyService
  ) {
    this.commandFactory = new CommandFactory(this.toeicProgressService, this.userService, this.toeicQuestionService, this.toeicTestService, this.topicVocabularyService);
  }
>>>>>>> 7346320aac4830aeeaf520f4435c2b160358634d

  async routeCommand(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    const content = message.content.t?.trim();
    if (!content || !content.startsWith("*")) return;

    const command = content.slice(1).toLowerCase();
    const handler = this.commandFactory.getHandler(command);

    if (!handler) {
      await message.reply(parseMarkdown(`⚠️ Invalid command. Use *help to see the list of commands.`));
      return;
    }

    try {
      await handler.handle(channel, message);
    } catch (error: any) {
      await handleBotError(channel, error);
    }
  }
}
