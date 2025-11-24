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

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_DELETE_USER_DICTIONARY)
export class DeleteUserDictionaryHandler extends BaseHandler<MMessageButtonClicked> {
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
      if (!user) return;

      await this.vocabularyService.deleteVocabularyOfUser(
        vocabIds,
        user.id
      );

      const page = 1;
      const limit = 3;
      const remaining = await this.vocabularyService.getUserDictionary(page, limit);

      if (!remaining || remaining.data.length === 0) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "🫠 You have no more words in your favorites list." }
        );
        return;
      }

      const userDictionaryHandler = await this.moduleRef.create(UserDictionaryHandler);
      userDictionaryHandler.setContext(this.event, this.mezonMessage, this.mezonChannel);
      await userDictionaryHandler.handle();
    } catch (error) {
      console.error("❌ Error in DeleteMyVocabulary:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.user_id,
        { t: "⚠️ Error deleting vocabulary. Please try again later." }
      );
    }
  }
}
