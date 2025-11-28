import { Injectable, Scope } from "@nestjs/common";
import { Interaction } from "../decorators/interaction.decorator";
import { BaseHandler, MChannelMessage } from "./base";
import { CommandType } from "../enums/commands.enum";
import { MezonClient } from "mezon-sdk";
import { ChainWordService } from "../../chain-word/chain-word.service";
import { ChainWord } from "../../../entities/chain-word.entity";

@Injectable({ scope: Scope.TRANSIENT })
@Interaction(CommandType.COMMAND_CHAIN_WORD)
export class ChainWordHandler extends BaseHandler<MChannelMessage> {
  constructor(
    protected readonly client: MezonClient,
    private readonly chainWordService: ChainWordService,
  ) {
    super(client);
  }
  private usedWords = new Set<string>();

  async handle(): Promise<void> {
    const content = this.event.content.t || "";
    const word = content.replace("*e-chain ", "").trim().toLowerCase();
    const mezonId = this.event.sender_id;
    console.log(this.mezonMessage)

    if (!word) {
      await this.mezonChannel.sendEphemeral(
        this.event.sender_id,
        { t: "⚠️ Please type a word to translate!" }
      );
      return;
    }

    if (word.length < 2) {
      await this.mezonMessage.reply({ t: "⚠️ Your word must have at least 2 letters!" });
      return;
    }

    const urlDictionary = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    let isValidWord = true;
    try {
      const response = await fetch(urlDictionary);
      const data = await response.json();

      if (!Array.isArray(data)) {
        isValidWord = false;
      }
    } catch (err) {
      isValidWord = false;
    }

    if (!isValidWord) {
      await this.mezonMessage.reply({ t: "🤖 Bot Win (invalid word)" });
      await this.chainWordService.deleteWord(mezonId);
      return;
    }

    const existingBotWord = await this.chainWordService.getNewWordOfBot("Bot", mezonId);
    const firstChar = word.charAt(0).toLowerCase();
    const lastChar = word.charAt(word.length - 1).toLowerCase();

    if (existingBotWord !== null) {
      const lastCharOfBot =
        existingBotWord.word.charAt(existingBotWord.word.length - 1).toLowerCase();

      if (firstChar !== lastCharOfBot) {
        await this.mezonMessage.reply({
          t: `🤖 Bot Win (your word must start with '${lastCharOfBot}')`
        });
        await this.chainWordService.deleteWord(mezonId);
        return;
      }
    }

    this.usedWords.add(word);

    const existingWordOfUser = await this.chainWordService.getWord(word, mezonId);
    if (existingWordOfUser) {
      await this.mezonMessage.reply(
        { t: `🤖 Bot Win (you cannot re-enter words that you or the bot have already entered '${word}')` }
      );
      await this.chainWordService.deleteWord(mezonId);
      return;
    }

    const newChainWord = new ChainWord();
    newChainWord.word = word;
    newChainWord.createBy = "User";
    newChainWord.mezonId = mezonId;

    await this.chainWordService.saveWord(newChainWord);

    const urlDatamuse = `https://api.datamuse.com/words?sp=${lastChar}*`;

    try {
      const data = await fetch(urlDatamuse).then(res => res.json());
      const words = data.map(item => item.word).filter(w => w && w.trim().split(" ").length === 1);
      console.log(words)

      let existingWordOfBot = null;
      let randomWord: string;
      let count = 0;
      let countStock = words.length;
      do {
        if (count > countStock) {
          await this.mezonMessage.reply(
            { t: `🏆 You Win` }
          );
          await this.chainWordService.deleteWord(mezonId);
          return;
        }
        count++;

        const randomIndex = Math.floor(Math.random() * words.length);
        randomWord = words[randomIndex];
        const existingWordOfBot = await this.chainWordService.getWord(randomWord, mezonId);
        if (existingWordOfBot) {
          urlDatamuse
          this.usedWords = this.usedWords.add(existingWordOfBot?.word)
        }
      } while (existingWordOfBot);

      const newChainWordAPI = new ChainWord();
      newChainWordAPI.word = randomWord;
      newChainWordAPI.createBy = "Bot";
      newChainWordAPI.mezonId = mezonId;

      const newWord = await this.chainWordService.saveWord(newChainWordAPI);

      await this.mezonMessage.reply(
        { t: `🤖 My word: ${newWord.word}` }
      );

    } catch (error) {
      console.log(error)
      throw new Error('Failed to fetch chain word');
    }
  } catch(error) {
    this.mezonMessage.reply(
      { t: `⚠️ Error fetching word data: ${error.message}` }
    );
  }
}

