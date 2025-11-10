import { Injectable, Scope } from "@nestjs/common";
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

@Injectable({ scope: Scope.TRANSIENT })
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

      const source = (!this.event.extra_data || this.event.extra_data.includes("vocab-select"))
        ? this.event.button_id
        : this.event.extra_data;

      const match = source.match(/show-vocabulary_topic:(\d+)_page:(\d+)/);
      if (!match) {
        await this.mezonMessage.reply({
          t: "⚠️ Invalid button data. Please try again.",
        });
        return;
      }

      const topicId = Number(match[1]);
      const page = Number(match[2]);

      const limit = 10;
      const { data: vocabularies, total } =
        await this.vocabularyService.getVocabulariesByTopic(topicId, page, limit);

      if (!vocabularies?.length) {
        await this.mezonMessage.reply({ t: "🚫 No more vocabularies found." });
        return;
      }

      const radioOptions: RadioFieldOption[] = vocabularies.map((vocab, index) => {
        const number = (page - 1) * limit + index + 1;
        const details = [
          `🔊 ${vocab.pronounce || "—"} | 🧩 *${vocab.partOfSpeech || "N/A"}*`,
          `Mean: ${vocab.meaning}`,
          vocab.exampleSentence ? `💬 _${vocab.exampleSentence}_` : null,
        ]
          .filter(Boolean)
          .join("\n");

        return {
          name: `${index}`,
          label: `${number}. ${vocab.word}`,
          value: vocab.id.toString(),
          description: details,
          style: EButtonMessageStyle.SUCCESS,
        };
      });

      const saveButton = new ButtonBuilder()
        .setId(`save-vocabulary_topic:${topicId}_page:${page}_id:${mezonUserId}`)
        .setLabel("❤️ Save selected")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      const paginationButtons: ButtonComponent[] = [];
      if (page > 1) {
        paginationButtons.push(
          new ButtonBuilder()
            .setId(`show-vocabulary_topic:${topicId}_page:${page - 1}_id:${mezonUserId}`)
            .setLabel("⬅ Prev")
            .setStyle(EButtonMessageStyle.SECONDARY)
            .build()
        );
      }
      if (page * limit < total) {
        paginationButtons.push(
          new ButtonBuilder()
            .setId(`show-vocabulary_topic:${topicId}_page:${page + 1}_id:${mezonUserId}`)
            .setLabel("Next ➡")
            .setStyle(EButtonMessageStyle.PRIMARY)
            .build()
        );
      }

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `📚 Vocabulary — Page ${page}`,
          description: `🧠 *Select the vocabulary you want to save:*`,
          footer: `📖 Page ${page}/${Math.ceil(total / limit)}`,
          fields: [
            {
              name: "Select Vocabulary",
              value: "",
              inputs: {
                id: `vocab-select_topic:${topicId}_page:${page}_id:${mezonUserId}`,
                type: EMessageComponentType.RADIO,
                component: radioOptions,
                max_options: radioOptions.length,
              },
            },
          ],
        })
        .addButtonsRow([saveButton])
        .addButtonsRow(paginationButtons)
        .build();

      await this.mezonMessage.update(messagePayload);
    } catch (error) {
      console.error("❌ Error in ShowVocabularyHandler:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading vocabularies.",
      });
    }
  }
}
