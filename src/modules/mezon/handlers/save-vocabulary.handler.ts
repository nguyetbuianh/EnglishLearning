import { Injectable, Scope } from "@nestjs/common";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { FavoriteVocabularyService } from "../../favorite-vocabulary/favorite-vocabulary.service";
import { CommandType } from "../enums/commands.enum";
import { Interaction } from "../decorators/interaction.decorator";
import { UserService } from "../../user/user.service";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { User } from "../../../entities/user.entity";

@Injectable({ scope: Scope.TRANSIENT })
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
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) {
        await this.mezonMessage.reply({ t: "⚠️ Missing user info." });
        return;
      }

      const extra = this.event.extra_data;
      if (!extra) {
        await this.mezonMessage.reply({
          t: "⚠️ Please select at least one vocabulary before saving.",
        });
        return;
      }

      let vocabIds: number[] = [];
      try {
        const data = JSON.parse(extra);
        const values = Object.values(data).flat();
        vocabIds = values.map((v) => Number(v)).filter((n) => !isNaN(n));
      } catch (e) {
        console.error("❌ Failed to parse extra_data:", extra, e);
      }

      if (vocabIds.length === 0) {
        await this.mezonMessage.reply({
          t: "⚠️ Please select at least one vocabulary before saving.",
        });
        return;
      }

      const user = await this.userService.getUser(mezonUserId);
      if (!user) {
        await this.mezonMessage.reply({ t: "🚫 User not found." });
        return;
      }

      let savedCount = 0;
      let alreadySaved: string[] = [];
      let notFound: number[] = [];

      for (const vocabId of vocabIds) {
        const vocabulary = await this.vocabularyService.findVocabularyById(vocabId);
        if (!vocabulary) {
          notFound.push(vocabId);
          continue;
        }

        const existing = await this.favoriteService.existingVocabularyAndUserId(
          user.id,
          vocabulary.id
        );

        if (existing) {
          alreadySaved.push(vocabulary.word);
          continue;
        }

        await this.favoriteService.saveVocabulary({
          user: user as User,
          vocabulary: vocabulary
        });
        savedCount++;
      }

      let replyMsg = `✅ Saved ${savedCount} vocabular${savedCount > 1 ? "ies" : "y"} to your favorites!`;
      if (alreadySaved.length > 0)
        replyMsg += `\n⚠️ Already saved: ${alreadySaved.join(", ")}`;
      if (notFound.length > 0)
        replyMsg += `\n🚫 Not found: ${notFound.join(", ")}`;

      await this.mezonMessage.reply({ t: replyMsg });
    } catch (error) {
      console.error("❌ Error in SaveVocabularyHandler:", error);
      await this.mezonMessage.reply({
        t: "⚠️ Error saving vocabulary. Please try again later.",
      });
    }
  }
}
