import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { UserService } from "../../user/user.service";
import { CommandType } from "../enums/commands.enum";
import { ModuleRef } from "@nestjs/core";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { UserDictionaryHandler } from "./user-dictionary.handler";
import { parseVocabId } from "../utils/vocab.util";
import { Role } from "../../../enum/role.enum";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_ACTIVE_USER_DICTIONARY)
export class ActiveUserDictionaryHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly vocabularyService: VocabularyService,
    private readonly userService: UserService,
    private readonly moduleRef: ModuleRef
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const vocabIds = await parseVocabId(this.event);
      if (!vocabIds || vocabIds.length === 0) {
        return;
      }

      const user = await this.userService.getUser(mezonUserId);
      if (!user || user.role !== Role.ADMIN) {
        await this.mezonMessage.reply({
          t: "⚠️ You do not have permission to perform this action.",
        });
        return;
      }

      await this.vocabularyService.updateActiveVocab(vocabIds);

      const page = 1;
      const limit = 3;
      const remaining = await this.vocabularyService.getUserDictionary(page, limit);

      if (!remaining || remaining.data.length === 0) {
        await this.mezonMessage.update({
          t: "🫠 You have no more words in your favorites list.",
        });
        return;
      }

      const userDictionaryHandler = await this.moduleRef.create(UserDictionaryHandler);
      userDictionaryHandler.setContext(this.event, this.mezonMessage, this.mezonChanel);
      await userDictionaryHandler.handle();
    } catch (error) {
      console.error("❌ Error in Delete vocabulary:", error);
      await this.mezonMessage.reply({
        t: "⚠️ Error deleting vocabulary. Please try again later.",
      });
    }
  }
}
