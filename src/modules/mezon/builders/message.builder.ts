import {
  ApiMessageAttachment,
  ButtonComponent,
  ChannelMessageContent,
  IMessageActionRow,
  SelectComponent,
} from "mezon-sdk";
import { IInteractiveMessageProps } from "mezon-sdk";
import { ButtonBuilder } from "./button.builder";

export class MessageBuilder {
  private text?: string;
  private embeds: IInteractiveMessageProps[] = [];
  private components: IMessageActionRow[] = [];

  private attachments: ApiMessageAttachment[] = [];

  setText(text: string): this {
    this.text = text;
    return this;
  }

  addEmbed(embed: IInteractiveMessageProps): this {
    this.embeds.push(embed);
    return this;
  }

  createEmbed(options: {
    color?: string;
    title?: string;
    description?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: string;
    timestamp?: boolean;
    imageUrl?: string;
    audioUrl?: string;
  }): this {
    if (options.audioUrl) {
      this.attachments.push({
        url: options.audioUrl,
        filetype: "audio/mpeg",
        filename: "question_audio.mp3",
      } as ApiMessageAttachment);
    }

    const embed: IInteractiveMessageProps = {
      color: options.color ?? "#1abc9c",
      title: options.title,
      description: options.description,
      fields: options.fields,
      footer: options.footer ? { text: options.footer } : undefined,
      timestamp: options.timestamp ? new Date().toISOString() : undefined,
      image: options.imageUrl ? { url: options.imageUrl } : undefined,
    };

    this.embeds.push(embed);
    return this;
  }


  addButtonsRow(buttons: (ButtonBuilder | ButtonComponent)[]): this {
    const builtButtons = buttons.map((b) =>
      b instanceof ButtonBuilder ? b.build() : b
    );
    this.components.push({ components: builtButtons });
    return this;
  }

  addSelectRow(selects: SelectComponent[]): this {
    this.components.push({ components: selects });
    return this;
  }

  addAttachment(attachment: ApiMessageAttachment): this {
    this.attachments.push(attachment);
    return this;
  }

  build() {
    if (!this.text && this.embeds.length === 0) {
      throw new Error("MessageBuilder: message must have text or embeds.");
    }

    return {
      t: this.text,
      embed: this.embeds.length > 0 ? this.embeds : undefined,
      components: this.components.length > 0 ? this.components : undefined,
      attachments: this.attachments.length > 0 ? this.attachments : undefined
    };
  }
}
