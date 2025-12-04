import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MMessageButtonClicked } from "./base";
import { EButtonMessageStyle, EMessageComponentType, MezonClient } from "mezon-sdk";
import { CommandType } from "../enums/commands.enum";
import { updateSession } from "../utils/update-session.util";
import { addWord, ChainWordStore, checkWordExists, resetUserWords } from "../session/chain-session.store";
import { ButtonBuilder } from "../builders/button.builder";
import { MessageBuilder } from "../builders/message.builder";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.BUTTON_GET_WORD)
export class GetWordHandler extends BaseHandler<MMessageButtonClicked> {
  constructor(
    protected readonly client: MezonClient,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    try {
      const mezonUserId = this.event.user_id;

      const word = await this.getVocab();
      if (!word) {
        await this.mezonChannel.sendEphemeral(
          mezonUserId,
          { t: "❗ Please fill in fields." }
        );
        return;
      }

      if (word.length < 2) {
        await this.mezonMessage.update({ t: "⚠️ Your word must have at least 2 letters!" });
        resetUserWords(mezonUserId);
        return;
      }

      if (checkWordExists(mezonUserId, word)) {
        await this.mezonMessage.update({
          t: `🤖 Bot Win (you cannot re-enter words already used: '${word}')`,
        });
        resetUserWords(mezonUserId);
        return;
      }

      const firstCharOfUser = word.charAt(0);

      const botWord = ChainWordStore.get(mezonUserId);
      const lastWordOfBot = botWord ? botWord[botWord.length - 1] : undefined;
      let lastCharOfBot: string;

      if (lastWordOfBot !== undefined) {
        lastCharOfBot = lastWordOfBot.charAt(lastWordOfBot.length - 1);
        if (firstCharOfUser !== lastCharOfBot) {
          await this.mezonMessage.update({
            t: `🤖 Bot Win! Your word must start with "${lastCharOfBot}", but you used "${firstCharOfUser}".`
          });
          resetUserWords(mezonUserId);
          return;
        }
      }
      addWord(mezonUserId, word);

      let isValidWord = true;
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        if (!Array.isArray(data)) isValidWord = false;
      } catch {
        isValidWord = false;
      }

      if (!isValidWord) {
        await this.mezonMessage.update({ t: "🤖 Bot Win (invalid word)" });
        resetUserWords(mezonUserId);
        return;
      }

      const lastCharOfUser = word.charAt(word.length - 1).toLowerCase();
      const urlDatamuse = `https://api.datamuse.com/words?sp=${lastCharOfUser}*`;

      try {
        const data = await fetch(urlDatamuse).then(res => res.json());
        const words = data
          .map((item) => item.word)
          .filter((w: string) => w && w.trim().split(" ").length === 1);

        const availableWords = words.filter((w: string) => !checkWordExists(mezonUserId, w));

        if (availableWords.length === 0) {
          await this.mezonMessage.update({ t: "🏆 You Win! Bot cannot find a word." });
          resetUserWords(mezonUserId);
          return;
        }

        const botWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        addWord(mezonUserId, botWord);
        const submitButton = new ButtonBuilder()
          .setId(`get-word_id:${mezonUserId}`)
          .setLabel("🚀 Submit")
          .setStyle(EButtonMessageStyle.SUCCESS)
          .build();

        const cancelButton = new ButtonBuilder()
          .setId(`cancel-test_id:${mezonUserId}`)
          .setLabel("🛑 Cancel")
          .setStyle(EButtonMessageStyle.DANGER)
          .build();

        const messagePayload = new MessageBuilder()
          .createEmbed({
            color: "#6a5acd",
            title: "🔤 Word Chain — Your Turn",
            description: ` \`🤖: ${botWord}\`\n🔗 Your word must start with: ${lastCharOfUser}`,
            fields: [
              {
                name: "✏️ Enter Your Word",
                value: "Type your word below:",
                inputs: {
                  id: "id-word",
                  type: EMessageComponentType.INPUT,
                  component: {
                    id: "id-word",
                    placeholder: "Type your next word...",
                    defaultValue: "",
                    required: true,
                  },
                },
              },
            ],
          })
          .addButtonsRow([submitButton, cancelButton])
          .build();

        await this.mezonMessage.update(messagePayload);

      } catch (error) {

      }
      await updateSession(this.mezonMessage.sender_id, undefined);
    } catch (error) {
      await this.mezonChannel.sendEphemeral(
        this.event.user_id,
        { t: "⚠️ An error occurred while saving the vocab. Please try again later." }
      );
    }
  }

  private async getVocab(): Promise<string | null> {
    const extra_data = this.event.extra_data;
    if (!extra_data) {
      return null;
    }
    const parsed = JSON.parse(extra_data);
    const word: string = parsed["id-word"];

    return word;
  }
}