import {
  ButtonComponent,
  ChannelMessageContent,
  IMessageActionRow,
} from "mezon-sdk";
import { IInteractiveMessageProps } from "mezon-sdk";
import { ButtonBuilder } from "mezon-sdk";

export class MessageBuilder {
  private text?: string;
  private embeds: IInteractiveMessageProps[] = [];
  private components: IMessageActionRow[] = [];

  setText(text: string): this {
    this.text = text;
    return this;
  }

  addEmbed(embed: IInteractiveMessageProps): this {
    this.embeds.push(embed);
    return this;
  }

  addButtons(buttons: (ButtonBuilder | ButtonComponent)[]): this {
    const builtButtons: ButtonComponent[] = buttons.flatMap((b) =>
      b instanceof ButtonBuilder ? b.build() : [b as ButtonComponent]
    );

    this.components.push({ components: builtButtons });
    return this;
  }

  build(): ChannelMessageContent {
    if (!this.text && this.embeds.length === 0) {
      throw new Error("MessageBuilder: message must have text or embeds.");
    }

    return {
      t: this.text,
      embed: this.embeds.length > 0 ? this.embeds : undefined,
      components: this.components.length > 0 ? this.components : undefined,
    };
  }
}
