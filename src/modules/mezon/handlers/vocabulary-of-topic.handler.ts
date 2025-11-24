import { Injectable, Scope } from "@nestjs/common";
import { BaseHandler, MMessageButtonClicked } from "./base";
import {
  EButtonMessageStyle,
  EMessageComponentType,
  MezonClient,
  ButtonComponent,
  RadioFieldOption,
} from "mezon-sdk";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { Interaction } from "../decorators/interaction.decorator";
import { MessageBuilder } from "../builders/message.builder";
import { ButtonBuilder } from "../builders/button.builder";
import { CommandType } from "../enums/commands.enum";
import { buildRadioOptions } from "../utils/vocab.util";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { sendMessageVocab } from "../utils/reply-message.util";

interface BuildPaginationButtonsParams {
  topicId: number;
  page: number;
  total: number;
  mezonUserId: string;
}

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_SHOW_VOCABULARY)
export class ShowVocabularyHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
    private readonly vocabularyService: VocabularyService
  ) {
    super(client);
  }

  setContext(event: MMessageButtonClicked, mezonMessage: Message, mezonChannel: TextChannel) {
    this.event = event;
    this.mezonMessage = mezonMessage;
    this.mezonChannel = mezonChannel;
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;
      if (!mezonUserId) return;

      const parsed = await this.parseButtonId(this.event);
      if (!parsed) {
        console.warn("❗ Cannot parse topicId/page from button_id:", this.event.button_id);
        return;
      }
      const { topicId, page } = parsed;

      const limit = 3;
      const { data: vocabularies, total } = await this.vocabularyService.getVocabulariesByTopic(topicId, page, limit);
      if (!vocabularies?.length) {
        return;
      }

      const radioOptions: RadioFieldOption[] = await buildRadioOptions(vocabularies, page, limit);

      const saveButton = new ButtonBuilder()
        .setId(`save-vocabulary_topic:${topicId}_page:${page}_id:${mezonUserId}`)
        .setLabel("❤️ Save")
        .setStyle(EButtonMessageStyle.SUCCESS)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonUserId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const paginationButtons: ButtonComponent[] = await this.buildPaginationButtons({
        topicId: topicId,
        page: page,
        total: total,
        mezonUserId: mezonUserId
      });

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
        .addButtonsRow([saveButton, cancelButton])
        .addButtonsRow(paginationButtons)
        .build();

      const isButtonClicked = "button_id" in this.event;
      if (isButtonClicked) {
        await sendMessageVocab({
          mezonUserId: mezonUserId,
          mezonMessage: this.mezonMessage,
          mezonChannel: this.mezonChannel,
          messagePayload: messagePayload
        });
      }

    } catch (error) {
      console.error("❌ Error in ShowVocabularyHandler:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.sender_id,
        { t: "⚠️ An error occurred while loading vocabularies." }
      );
    }
  }

  private async parseButtonId(event: MMessageButtonClicked): Promise<{ topicId: number; page: number } | void> {
    const source = (!event.extra_data || event.extra_data.includes("vocab-select"))
      ? event.button_id
      : event.extra_data;

    const match = source.match(/show-vocabulary_topic:(\d+)_page:(\d+)/);
    if (!match) {
      return;
    }

    const topicId = Number(match[1]);
    const page = Number(match[2]);

    return { topicId, page };
  }

  private async buildPaginationButtons(buildPaginationButtonsParams: BuildPaginationButtonsParams): Promise<ButtonComponent[]> {
    const { topicId, page, total, mezonUserId } = buildPaginationButtonsParams;
    const limit = 3;
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
    return paginationButtons;
  }
}
