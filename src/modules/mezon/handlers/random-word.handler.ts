import { VocabularyService } from '../../vocabulary/vocabulary.service';
import { PexelsService } from '../../pexels/pexels.service';
import { MessageBuilder } from '../builders/message.builder';
import { ChannelMessageContent, EButtonMessageStyle, EMessageComponentType, MezonClient } from 'mezon-sdk';
import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { ButtonBuilder } from '../builders/button.builder';
import { ChannelService } from '../../channel/channel.service';
import { maskWord } from '../../../utils/guess-word.util';

@Injectable()
export class RandomWordHandler {
  constructor(
    private readonly client: MezonClient,
    private readonly vocabService: VocabularyService,
    private readonly pexelsService: PexelsService,
    private readonly channelService: ChannelService
  ) { }

  //@Cron('0 8-22/4 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handler() {
    try {
      const batchSize = 100;
      let offset = 0;

      while (true) {
        const channels = await this.channelService.getChannelsInBatches(batchSize, offset);
        if (!channels.length) {
          break;
        }

        await Promise.all(
          channels.map(async (channel) => {
            try {
              const { word, imageUrl } = await this.getRandomWordImage();
              const maskedWord = maskWord(word);
              const messagePayload = this.guessWordMessage(word, imageUrl, maskedWord);
              await this.sendMessage(channel.channelId, messagePayload);
            } catch (err) {
              console.log(`❌ Failed to send to ${channel.channelId}`, err);
              return null;
            }
          })
        );

        offset += batchSize;
        await new Promise(res => setTimeout(res, 500));
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  private async sendMessage(channelId: string, content: ChannelMessageContent) {
    try {
      const dmClan = await this.client.clans.fetch('0');
      const channel = await dmClan.channels.fetch(channelId);
      if (!channel) {
        return;
      }
      await channel.send(content);
    } catch (error) {
      console.log(`❌ Failed to send DM to ${channelId}:`, error);
    }
  }

  async getRandomWordImage(): Promise<{ word: string; imageUrl: string }> {
    const vocab = await this.vocabService.getRandomVocabulary();
    if (!vocab) throw new Error("No vocabulary found");

    const imageUrl = await this.pexelsService.getImage(vocab);

    return { word: vocab.word, imageUrl: imageUrl };
  }

  private guessWordMessage(word: string, imageUrl: string, maskedWord: string) {
    const submitButton = new ButtonBuilder()
      .setId(`word-answer_word:${word}_imageUrl:${imageUrl}_maskedWord:${maskedWord}`)
      .setLabel("Submit")
      .setStyle(EButtonMessageStyle.PRIMARY)
      .build();

    const messagePayload = new MessageBuilder()
      .createEmbed({
        color: "#FFD700",
        title: "🧠 Guess the Vocabulary Word!",
        description: `
          *Hint:* The word looks like this: ${maskedWord}

          Can you guess what it is based on the image below?`,
        imageUrl: imageUrl,
        fields: [
          {
            name: "Your Answer",
            value: "",
            inputs: {
              id: "form-user-guess",
              type: EMessageComponentType.INPUT,
              component: {
                id: "form-user-guess-input",
                placeholder: "Type your guess here...",
                defaultValue: "",
                required: true,
              },
            },
          },
        ],
        footer: "Vocabulary Guessing Game • Try your best!",
        timestamp: true,
      })
      .addButtonsRow([submitButton])
      .build();

    return messagePayload;
  }
}
