import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { VocabularyService } from "src/modules/vocabulary/vocabulary.service";
import { FavoriteVocabularyService } from "src/modules/favorite-vocabulary/favorite-vocabulary.service";
import { UserService } from "src/modules/user/user.service";
import { CommandType } from "../enums/commands.enum";
import { VocabularyOfUserHandler } from "./vocabulary-of-user.handler";

@Injectable()
@Interaction(CommandType.BUTTON_DELETE_MY_VOCABULARY)
export class DeleteMyVocabulary extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly favoriteVocabularyService: FavoriteVocabularyService,
    private readonly userService: UserService,
    private readonly vocabularyOfUserHandler: VocabularyOfUserHandler
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const extra = this.event.extra_data;
      if (!extra) return;

      // ✅ Lấy danh sách ID vocab từ extra_data
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

      this.vocabularyOfUserHandler["event"] = this.event;
      this.vocabularyOfUserHandler["mezonMessage"] = this.mezonMessage;
      await this.vocabularyOfUserHandler.handle();
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
