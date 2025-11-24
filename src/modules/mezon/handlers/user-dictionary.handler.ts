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
import { UserService } from "../../user/user.service";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { VocabularyService } from "../../vocabulary/vocabulary.service";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { sendMessageVocab } from "../utils/reply-message.util";
import { buildRadioOptions, parseButtonId } from "../utils/vocab.util";
import { Role } from "../../../enum/role.enum";

interface BuildPaginationButtonsParams {
  page: number;
  total: number;
  mezonUserId: string;
}

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_USER_DICTIONARY)
export class UserDictionaryHandler extends BaseHandler<
  MChannelMessage | MMessageButtonClicked
> {
  constructor(
    protected readonly client: MezonClient,
    private readonly vocabularyService: VocabularyService,
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
      const { page, mezonUserId } = await parseButtonId(this.event);
      if (!page && !mezonUserId) return;

      if (!mezonUserId) return;
      const user = await this.userService.getUser(mezonUserId);
      if (!user || user.role !== Role.ADMIN) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "⚠️ You do not have permission to perform this action." }
        );
        return;
      }

      const limit = 3;
      const { data: vocabularies, total } =
        await this.vocabularyService.getUserDictionary(
          page,
          limit
        );

      if (!vocabularies?.length) {
        return;
      }

      const radioOptions: RadioFieldOption[] = await buildRadioOptions(vocabularies, page, limit);

      const activeButton = new ButtonBuilder()
        .setId(`active-user-dictionary_page:${page}_id:${mezonUserId}`)
        .setLabel("✅ Active")
        .setStyle(EButtonMessageStyle.PRIMARY)
        .build();

      const deleteButton = new ButtonBuilder()
        .setId(`delete-user-dictionary_page:${page}_id:${mezonUserId}`)
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
          title: `📚 User Dictionary — Page ${page}`,
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
        .addButtonsRow([activeButton, deleteButton, cancelButton])
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

  private async buildPaginationButtons(buildPaginationButtonsParams: BuildPaginationButtonsParams): Promise<ButtonComponent[]> {
    const { page, total, mezonUserId } = buildPaginationButtonsParams;
    const limit = 3;
    const paginationButtons: ButtonComponent[] = [];
    if (page > 1) {
      paginationButtons.push(
        new ButtonBuilder()
          .setId(`e-user-dictionary_page:${page - 1}_id:${mezonUserId}`)
          .setLabel("⬅ Prev")
          .setStyle(EButtonMessageStyle.SECONDARY)
          .build()
      );
    }
    if (page * limit < total) {
      paginationButtons.push(
        new ButtonBuilder()
          .setId(`e-user-dictionary_page:${page + 1}_id:${mezonUserId}`)
          .setLabel("Next ➡")
          .setStyle(EButtonMessageStyle.PRIMARY)
          .build()
      );
    }
    return paginationButtons;
  }
}
