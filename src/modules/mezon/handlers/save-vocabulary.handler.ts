import { Injectable } from "@nestjs/common";
import { BaseHandler, MMessageButtonClicked } from "./base";
import {
  EButtonMessageStyle,
  MezonClient,
} from "mezon-sdk";
import { FavoriteVocabularyService } from "src/modules/favorite-vocabulary/favorite-vocabulary.service";
import { VocabularyService } from "src/modules/vocabulary/vocabulary.service";
import { Interaction } from "../decorators/interaction.decorator";
import { CommandType } from "../enums/commands.enum";
import { FavoriteVocabulary } from "src/entities/favorite-vocabulary.entity";
import { UserService } from "src/modules/user/user.service";

@Injectable()
@Interaction(CommandType.BUTTON_SAVE_VOCABULARY)
export class SaveVocabularyHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly favoriteService: FavoriteVocabularyService,
    private readonly vocabularyService: VocabularyService,
    private readonly userService: UserService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const rawExtra = this.event.extra_data || this.event.button_id || "";
      const matches = rawExtra.match(/topic:(\d+)_page:(\d+)_id:(\d+)/);
      if (!matches) {
        await this.mezonMessage.reply({
          t: "⚠️ Unable to determine data from push button. Please try again!",
        });
        return;
      }

      const [_, topicIdStr, pageStr, mezonUserIdStr] = matches;
      const mezonUserId = Number(mezonUserIdStr);

      const selectedId = this.event.extra_data;
      if (!selectedId) {
        await this.mezonMessage.reply({
          t: "📋 You have not selected any words to save!",
        });
        return;
      }

      const existingVocabulary = await this.vocabularyService.findVocabularyById(Number(selectedId));
      if (!existingVocabulary) {
        await this.mezonMessage.reply({
          t: "❌ The selected vocabulary was not found.",
        });
        return;
      }

      const existingUSer = await this.userService.findUserById(mezonUserId);
      if (!existingUSer) {
        await this.mezonMessage.reply({
          t: "❌ User not found.",
        });
        return;
      }

      const fav = new FavoriteVocabulary();
      fav.user = existingUSer;
      fav.vocabulary = existingVocabulary;
      fav.createdAt = new Date();

      await this.favoriteService.saveVocabulary(fav);

      await this.mezonMessage.reply({
        t: `💾 Saved *${existingVocabulary.word}* to your favorites list!❤️`,
      });
    } catch (error) {
      console.error("❌ Error in SaveFavoriteVocabularyHandler:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while saving the vocabulary. Please try again later!",
      });
    }
  }
}
