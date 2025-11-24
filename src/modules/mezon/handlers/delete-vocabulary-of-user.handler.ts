import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { FavoriteVocabularyService } from "../../favorite-vocabulary/favorite-vocabulary.service";
import { UserService } from "../../user/user.service";
import { CommandType } from "../enums/commands.enum";
import { VocabularyOfUserHandler } from "./vocabulary-of-user.handler";
import { ModuleRef } from "@nestjs/core";
import { parseVocabId } from "../utils/vocab.util";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_DELETE_MY_VOCABULARY)
export class DeleteMyVocabulary extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly favoriteVocabularyService: FavoriteVocabularyService,
    private readonly userService: UserService,
    private readonly moduleRef: ModuleRef
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const extra = this.event.extra_data;
      if (!extra) return;

      const vocabIds = await parseVocabId(this.event);
      if (!vocabIds || vocabIds.length === 0) {
        return;
      }

      const user = await this.userService.getUser(mezonUserId);
      if (!user) return;

      await this.favoriteVocabularyService.deleteVocabularyOfUser(
        vocabIds,
        user.id
      );

      const remaining = await this.favoriteVocabularyService.getVocabulary(user.id);

      if (!remaining || remaining.data.length === 0) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "🫠 You have no more words in your favorites list." }
        );
        return;
      }

      const vocabHandler = await this.moduleRef.create(VocabularyOfUserHandler);
      vocabHandler.setContext(this.event, this.mezonMessage, this.mezonChannel);
      await vocabHandler.handle();
    } catch (error) {
      console.error("❌ Error in DeleteMyVocabulary:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.user_id,
        { t: "⚠️ Error deleting vocabulary. Please try again later." }
      );
    }
  }
}
