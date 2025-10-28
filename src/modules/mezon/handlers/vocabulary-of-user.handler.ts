import { Injectable } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage, MMessageButtonClicked } from "./base";
import {
  ButtonComponent,
  EButtonMessageStyle,
  EMessageComponentType,
  MezonClient,
  RadioFieldOption,
} from "mezon-sdk";
import { FavoriteVocabularyService } from "src/modules/favorite-vocabulary/favorite-vocabulary.service";
import { UserService } from "src/modules/user/user.service";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";

@Injectable()
@Interaction("my-vocab")
export class VocabularyOfUserHandler extends BaseHandler<
  MChannelMessage | MMessageButtonClicked
> {
  constructor(
    protected readonly client: MezonClient,
    private readonly favoriteVocabularyService: FavoriteVocabularyService,
    private readonly userService: UserService
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const isButtonClicked = "button_id" in this.event;
      console.log("Button Clicked:", isButtonClicked);

      let page = 1;
      let mezonUserId: string;

      if (isButtonClicked) {
        const event = this.event as MMessageButtonClicked;

        const buttonId = event.button_id;
        console.log("Button ID:", buttonId);

        const match = buttonId.match(/page:(\d+)_id:([A-Za-z0-9_-]+)/);
        if (match) {
          page = Number(match[1]);
          mezonUserId = match[2];
        } else {
          console.warn("❗ Không đọc được page/id từ button_id:", buttonId);
          mezonUserId = event.user_id;
        }
      } else {
        mezonUserId = (this.event as MChannelMessage).sender_id;
      }

      console.log("mezonUserId:", mezonUserId, "| page:", page);
      if (!mezonUserId) return;

      const user = await this.userService.findUserByMezonId(mezonUserId);
      if (!user) {
        await this.mezonMessage.reply({
          t: "⚠️ User not found",
        });
        return;
      }

      const limit = 3;
      const { data: favoriteVocabularies, total } =
        await this.favoriteVocabularyService.getVocabularyOfUser(
          user.id,
          page,
          limit
        );

      if (!favoriteVocabularies?.length) {
        await this.mezonMessage.reply({
          t: "⚠️ You haven't saved any vocabularies yet.",
        });
        return;
      }

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
            value: favVocab.id.toString(),
            description: details,
            style: EButtonMessageStyle.SUCCESS,
          };
        }
      );

      console.log("radioOptions:", radioOptions);

      const deleteButton = new ButtonBuilder()
        .setId(`delete-vocabulary_page:${page}_id:${mezonUserId}`)
        .setLabel("❌ Delete vocabulary")
        .setStyle(EButtonMessageStyle.DANGER)
        .build();
      
      const paginationButtons: ButtonComponent[] = [];
      if (page > 1) {
        paginationButtons.push(
          new ButtonBuilder()
            .setId(`my-vocab_page:${page - 1}_id:${mezonUserId}`)
            .setLabel("⬅ Prev")
            .setStyle(EButtonMessageStyle.SECONDARY)
            .build()
        );
      }
      if (page * limit < total) {
        paginationButtons.push(
          new ButtonBuilder()
            .setId(`my-vocab_page:${page + 1}_id:${mezonUserId}`)
            .setLabel("Next ➡")
            .setStyle(EButtonMessageStyle.PRIMARY)
            .build()
        );
      }

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
        .addButtonsRow([deleteButton])
        .addButtonsRow(paginationButtons)
        .build();

      if (isButtonClicked) {
        await this.mezonMessage.update(messagePayload);
      } else {
        await this.mezonMessage.reply(messagePayload);
      }
    } catch (error) {
      console.error("❌ Error in VocabularyOfUserHandler:", error);
      await this.mezonMessage.reply({
        t: "⚠️ An error occurred while loading vocabularies.",
      });
    }
  }
}
