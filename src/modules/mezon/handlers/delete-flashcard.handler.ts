import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { MezonClient } from "mezon-sdk";
import { UserService } from "../../user/user.service";
import { CommandType } from "../enums/commands.enum";
import { ModuleRef } from "@nestjs/core";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { MyFlashCardHandler } from "./my-flashcard.handler";
import { parseVocabId } from "../utils/vocab.util";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_DELETE_MY_FLASHCARD)
export class DeleteMyFlashcardHandler extends BaseHandler<MMessageButtonClicked> {
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
      const remaining = await this.vocabularyService.getVocabularyOfUser(user.id, page, limit);

      if (!remaining || remaining.data.length === 0) {
        await this.mezonMessage.update({
          t: "🫠 You have no more words in your favorites list.",
        });
        return;
      }

      const myFlashCardHandler = await this.moduleRef.create(MyFlashCardHandler);
      myFlashCardHandler.setContext(this.event, this.mezonMessage, this.mezonChanel);
      await myFlashCardHandler.handle();
    } catch (error) {
      console.error("❌ Error in DeleteMyVocabulary:", error);
      await this.mezonMessage.reply({
        t: "⚠️ Error deleting vocabulary. Please try again later.",
      });
    }
  }
}
