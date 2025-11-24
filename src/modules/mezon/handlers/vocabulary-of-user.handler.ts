import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage, MMessageButtonClicked } from "./base";
import {
  ButtonComponent,
  EButtonMessageStyle,
  EMessageComponentType,
  MezonClient,
  RadioFieldOption,
} from "mezon-sdk";
import { FavoriteVocabularyService } from "../../favorite-vocabulary/favorite-vocabulary.service";
import { UserService } from "../../user/user.service";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { FavoriteVocabulary } from "../../../entities/favorite-vocabulary.entity";
import { sendMessageVocab } from "../utils/reply-message.util";

interface BuildPaginationButtonsParams {
  page: number;
  total: number;
  mezonUserId: string;
}

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_ALL_VOCABULARY_OF_USER)
export class VocabularyOfUserHandler extends BaseHandler<
  MChannelMessage | MMessageButtonClicked
> {
  constructor(
    protected readonly client: MezonClient,
    private readonly favoriteVocabularyService: FavoriteVocabularyService,
    private readonly userService: UserService,
  ) {
    super(client);
  }

  setContext(event: MChannelMessage | MMessageButtonClicked, mezonMessage: Message, mezonChannel: TextChannel) {
    this.event = event;
    this.mezonMessage = mezonMessage;
    this.mezonChannel = mezonChannel;
  }

  async handle(): Promise<void> {
    try {
      const { page, mezonUserId } = await this.parseButtonId(this.event);
      if (!page && !mezonUserId) return;

      if (!mezonUserId) return;
      const user = await this.userService.getUser(mezonUserId);
      if (!user) return;

      const limit = 3;
      const { data: favoriteVocabularies, total } =
        await this.favoriteVocabularyService.getVocabularyOfUser(
          user.id,
          page,
          limit
        );

      if (!favoriteVocabularies?.length) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "⚠️ You haven't saved any vocabularies yet." }
        );
        return;
      }

      const radioOptions: RadioFieldOption[] = await this.buildRadioOptions(favoriteVocabularies, page, limit);

      const deleteButton = new ButtonBuilder()
        .setId(`delete-my-vocabulary_page:${page}_id:${mezonUserId}`)
        .setLabel("✖️ Delete")
        .setStyle(EButtonMessageStyle.SECONDARY)
        .build();

      const cancelButton = new ButtonBuilder()
        .setId(`cancel-test_id:${mezonUserId}`)
        .setLabel("❌ Cancel")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();

      const paginationButtons: ButtonComponent[] = await this.buildPaginationButtons({
        page: page,
        total: total,
        mezonUserId: mezonUserId
      });

      const messagePayload = new MessageBuilder()
        .createEmbed({
          color: "#3498db",
          title: `📚 Your Saved Vocabulary — Page ${page}`,
          description: `🧠 *Select the vocabulary you want to manage:*`,
          footer: `📖 Page ${page}/${Math.ceil(total / limit)}`,
          fields: [
            {
              name: "Select Vocabulary",
              value: "",
              inputs: {
                id: `vocabulary-select_page:${page}_id:${mezonUserId}`,
                type: EMessageComponentType.RADIO,
                component: radioOptions,
                max_options: radioOptions.length,
              },
            },
          ],
        })
        .addButtonsRow([deleteButton, cancelButton])
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
      } else {
        const replyMessage = await this.mezonMessage.reply(messagePayload);
        await updateSession(this.mezonMessage.sender_id, undefined, replyMessage.message_id);
      }
    } catch (error) {
      console.error("❌ Error in VocabularyOfUserHandler:", error);
      await this.mezonChannel.sendEphemeral(
        this.event.sender_id,
        { t: "⚠️ An error occurred while loading vocabularies." }
      );
    }
  }

  private async parseButtonId(event: MMessageButtonClicked | MChannelMessage): Promise<{ page: number, mezonUserId: string }> {
    const isButtonClicked = "button_id" in event;
    let page = 1;
    let mezonUserId: string;

    if (isButtonClicked) {
      const eventButton = event as MMessageButtonClicked;

      const buttonId = eventButton.button_id;

      const match = buttonId.match(/page:(\d+)_id:([A-Za-z0-9_-]+)/);
      if (match) {
        page = Number(match[1]);
        mezonUserId = match[2];
        return { page, mezonUserId };
      } else {
        console.warn("❗ Cannot read page/id from node_id:", buttonId);
        mezonUserId = eventButton.user_id;
        return { page, mezonUserId };
      }
    } else {
      mezonUserId = (event as MChannelMessage).sender_id;
      return { page, mezonUserId };
    }
  }

  private async buildRadioOptions(favoriteVocabularies: FavoriteVocabulary[], page: number, limit: number): Promise<RadioFieldOption[]> {
    const radioOptions: RadioFieldOption[] = favoriteVocabularies.map(
      (favVocab, index) => {
        const number = (page - 1) * limit + index + 1;
        const details = [
          `🔊 /${favVocab.vocabulary.pronounce || "—"}/ | 🧩 *${favVocab.vocabulary.partOfSpeech || "N/A"
          }*`,
          `🇻🇳 ${favVocab.vocabulary.meaning}`,
          favVocab.vocabulary.exampleSentence
            ? `💬 _${favVocab.vocabulary.exampleSentence}_`
            : null,
        ]
          .filter(Boolean)
          .join("\n");

        return {
          name: `${index}`,
          label: `${number}. ${favVocab.vocabulary.word}`,
          value: favVocab.vocabulary.id.toString(),
          description: details,
          style: EButtonMessageStyle.SUCCESS,
        };
      }
    );
    return radioOptions;
  }

  private async buildPaginationButtons(buildPaginationButtonsParams: BuildPaginationButtonsParams): Promise<ButtonComponent[]> {
    const { page, total, mezonUserId } = buildPaginationButtonsParams;
    const limit = 3;
    const paginationButtons: ButtonComponent[] = [];
    if (page > 1) {
      paginationButtons.push(
        new ButtonBuilder()
          .setId(`e-my-vocab_page:${page - 1}_id:${mezonUserId}`)
          .setLabel("⬅ Prev")
          .setStyle(EButtonMessageStyle.SECONDARY)
          .build()
      );
    }
    if (page * limit < total) {
      paginationButtons.push(
        new ButtonBuilder()
          .setId(`e-my-vocab_page:${page + 1}_id:${mezonUserId}`)
          .setLabel("Next ➡")
          .setStyle(EButtonMessageStyle.PRIMARY)
          .build()
      );
    }
    return paginationButtons;
  }
}
