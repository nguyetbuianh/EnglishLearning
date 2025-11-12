import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { FavoriteVocabularyService } from "../../favorite-vocabulary/favorite-vocabulary.service";
import { UserService } from "../../user/user.service";
import { CommandType } from "../enums/commands.enum";
import { VocabularyOfUserHandler } from "./vocabulary-of-user.handler";
import { ModuleRef } from "@nestjs/core";

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

      let vocabIds: number[] = [];
      try {
        const data = JSON.parse(extra);
        const values = Object.values(data).flat();
        vocabIds = values.map((v) => Number(v)).filter((n) => !isNaN(n));
      } catch (e) {
        console.error("❌ Failed to parse extra_data:", extra, e);
      }

      if (vocabIds.length === 0) return;

      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) return;

      await this.favoriteVocabularyService.deleteVocabularyOfUser(
        vocabIds,
        user.id
      );

      const remaining = await this.favoriteVocabularyService.getVocabulary(user.id);

      if (!remaining || remaining.data.length === 0) {
        await this.mezonMessage.update({
          t: "🫠 You have no more words in your favorites list.",
        });
        return;
      }

      const vocabHandler = await this.moduleRef.create(VocabularyOfUserHandler);
      vocabHandler["event"] = this.event;
      vocabHandler["mezonMessage"] = this.mezonMessage;
      await vocabHandler.handle();
      await this.mezonMessage.reply({
        t: `✅ Deleted ${vocabIds.length} vocabular${vocabIds.length > 1 ? "ies" : "y"}...`,
      });

    } catch (error) {
      console.error("❌ Error in DeleteMyVocabulary:", error);
      await this.mezonMessage.reply({
        t: "⚠️ Error deleting vocabulary. Please try again later.",
      });
    }
  }
}
