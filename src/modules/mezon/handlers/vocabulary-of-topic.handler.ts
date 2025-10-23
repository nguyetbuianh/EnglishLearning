import { Injectable } from "@nestjs/common";
import { BaseHandler, MMessageButtonClicked } from "./base";
import {
  EButtonMessageStyle,
  MezonClient,
  ButtonComponent,
} from "mezon-sdk";
import { VocabularyService } from "src/modules/vocabulary/vocabulary.service";
import { Interaction } from "../decorators/interaction.decorator";
import { MessageBuilder } from "../builders/message.builder";
import { ButtonBuilder } from "../builders/button.builder";
import { CommandType } from "../enums/commands.enum";

@Injectable()
@Interaction(CommandType.BUTTON_SHOW_VOCABULARY)
export class ShowVocabularyHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly vocabularyService: VocabularyService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const rawExtra =
        this.event.extra_data || this.event.button_id || "";

      const data = rawExtra.replace("show-vocabulary_", "");
      const [topicIdStr, pageStr] = data.split("_");

      const topicId = Number(topicIdStr);
      let page = Number(pageStr) || 1;

      if (!topicId || isNaN(topicId)) {
        console.warn("⚠️ topicId invalid:", topicIdStr);
        await this.mezonMessage.reply({
          t: "⚠️ Unable to identify the topic. Please go back and try again.",
        });
        return;
      }

      if (page < 1) page = 1;
      const limit = 2;

      const { data: vocabularies, total } =
        await this.vocabularyService.getVocabulariesByTopic(topicId, page, limit);

      if (!vocabularies || vocabularies.length === 0) {
        await this.mezonMessage.reply({
          t: "🚫 You’ve reached the last page. No more words to show.",
        });
        return;
      }

      const vocabularyList = vocabularies
        .map(
          (vocab, index) =>
            `**${(page - 1) * limit + index + 1}.** 📝 **${vocab.word}** — *${vocab.meaning}*`
        )
        .join("\n\n");

      const buttons: ButtonComponent[] = [];

      if (page > 1) {
        const previous = new ButtonBuilder()
          .setId(`show-vocabulary_${topicId}_${page - 1}`)
          .setLabel("⬅ Previous")
          .setStyle(EButtonMessageStyle.SECONDARY)
          .build();
        buttons.push(previous);
      }

      if (page * limit < total) {
        const next = new ButtonBuilder()
          .setId(`show-vocabulary_${topicId}_${page + 1}`)
          .setLabel("Next ➡")
          .setStyle(EButtonMessageStyle.PRIMARY)
          .build();
        buttons.push(next);
      }

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `📚 Vocabulary List — Page ${page}`,
          description: vocabularyList,
          footer: `Showing ${vocabularies.length} vocabularies (Page ${page}/${Math.ceil(
            total / limit
          )}).`,
        })
        .addButtonsRow(buttons)
        .build();

      await this.mezonMessage.update(messagePayload);
    } catch (error) {
      console.error("❌ Error in ShowVocabularyHandler:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading the vocabularies. Please try again later.",
      });
    }
  }
}
