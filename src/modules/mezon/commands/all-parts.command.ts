import { CommandHandler } from '../interfaces/command-handler.interface';
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { handleBotError } from '../utils/error-handler';
import { ToeicPartService } from 'src/modules/toeic/services/toeic-part.service';
import { createEmbedMessage } from '../utils/embed.util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AllPartsCommandHandler implements CommandHandler {
  constructor(private toeicPartService: ToeicPartService) { }

  async handle(channel: TextChannel, message: Message): Promise<void> {
    try {
      const parts = await this.toeicPartService.getAllParts();

      const fields = parts.map(part => ({
        name: `Part ${part.partNumber}: ${part.title}`,
        value: part.description,
        inline: false
      }));

      const messagePayload = createEmbedMessage(
        "📚 TOEIC Parts Overview",
        "Here are all the available TOEIC test parts:",
        fields
      );

      await message.reply(messagePayload);

    } catch (error: any) {
      await handleBotError(channel, error);
    }
  }
}
