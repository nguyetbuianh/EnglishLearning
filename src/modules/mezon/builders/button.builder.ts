import {
  ButtonComponent,
  EButtonMessageStyle,
  EMessageComponentType,
} from "mezon-sdk";

export class ButtonBuilder {
  private id!: string;
  private label!: string;
  private style: EButtonMessageStyle = EButtonMessageStyle.SECONDARY;
  private url?: string;

  setId(id: string): this {
    this.id = id;
    return this;
  }

  setLabel(label: string): this {
    this.label = label;
    return this;
  }

  setStyle(style: EButtonMessageStyle): this {
    this.style = style;
    return this;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  build(): ButtonComponent {
    if (!this.id || !this.label) {
      throw new Error("ButtonBuilder: missing required fields (id, label).");
    }

    return {
      type: EMessageComponentType.BUTTON,
      id: this.id,
      component: {
        label: this.label,
        style: this.style,
        url: this.url,
      },
    };
  }
}
