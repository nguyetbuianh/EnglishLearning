import { Injectable } from "@nestjs/common";
import { BaseHandler, MMessageButtonClicked } from "./base";
import {
  EButtonMessageStyle,
  EMessageComponentType,
  MezonClient,
  ButtonComponent,
  RadioFieldOption,
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
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const rawExtra = this.event.extra_data || this.event.button_id || "";
      const data = rawExtra.replace("show-vocabulary_", "");
      const [topicIdStr, pageStr] = data.split("_");

      const topicId = Number(topicIdStr);
      let page = Number(pageStr) || 1;

      if (!topicId || isNaN(topicId)) {
        await this.mezonMessage.reply({
          t: "⚠️ Unable to identify the topic. Please go back and try again.",
        });
        return;
      }

      if (page < 1) page = 1;
      const limit = 3;

      const { data: vocabularies, total } =
        await this.vocabularyService.getVocabulariesByTopic(topicId, page, limit);

      if (!vocabularies || vocabularies.length === 0) {
        await this.mezonMessage.reply({
          t: "🚫 You’ve reached the last page. No more words to show.",
        });
        return;
      }

      const radioOptions: RadioFieldOption[] = vocabularies.map((vocab, index) => {
        const number = (page - 1) * limit + index + 1;
        const details =
          `🔊 *${vocab.pronounce || "—"}* | 🧩 *Type:* ${vocab.partOfSpeech}\n` +
          `> 🇻🇳 *Meaning:* ${vocab.meaning}\n` +
          (vocab.exampleSentence
            ? `> 💬 *Example:* _${vocab.exampleSentence}_`
            : "");
        return {
          label: `${number}. ${vocab.word}`,
          value: vocab.id.toString(),
          description: details
        };
      });

      const saveButton = new ButtonBuilder()
        .setId(`save-selected_topic:${topicId}_page:${vocabularies}_id:${mezonUserId}`)
        .setLabel("❤️ Save selected to favorites")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      console.log(saveButton);

      const paginationButtons: ButtonComponent[] = [];
      if (page > 1) {
        paginationButtons.push(
          new ButtonBuilder()
            .setId(`show-vocabulary_${topicId}_${page - 1}`)
            .setLabel("⬅ Prev")
            .setStyle(EButtonMessageStyle.SECONDARY)
            .build()
        );
      }
      if (page * limit < total) {
        paginationButtons.push(
          new ButtonBuilder()
            .setId(`show-vocabulary_${topicId}_${page + 1}`)
            .setLabel("Next ➡")
            .setStyle(EButtonMessageStyle.PRIMARY)
            .build()
        );
      }

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `📚 Vocabulary — Page ${page}`,
          description: `🧠 *Select the vocabulary you want to learn:*`,
          footer: `📖 Page ${page}/${Math.ceil(total / limit)}`,
          fields: [
            {
              name: "Select Vocabulary",
              value: "",
              inputs: {
                id: `vocab_select_topic:${topicId}_page:${page}_id:${mezonUserId}`,
                type: EMessageComponentType.RADIO,
                component: radioOptions
              },
            },
          ],
        })
        .addButtonsRow([saveButton])
        .addButtonsRow(paginationButtons)
        .build();

      await this.mezonMessage.update({
        ...messagePayload,
      });
    } catch (error) {
      console.error("❌ Error in ShowVocabularyHandler:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading the vocabularies. Please try again later.",
      });
    }
  }
}
