import {
  EMessageComponentType,
  SelectComponent,
} from "mezon-sdk";

export interface ISelectionOption {
  label: string;
  value: string;
  description?: string;
}

export class SelectionBuilder {
  private id!: string;
  private placeholder?: string;
  private options: ISelectionOption[] = [];
  private minValues?: number;
  private maxValues?: number;

  setId(id: string): this {
    this.id = id;
    return this;
  }

  setPlaceholder(placeholder: string): this {
    this.placeholder = placeholder;
    return this;
  }

  addOption(label: string, value: string, description?: string): this {
    this.options.push({ label, value, description });
    return this;
  }

  addOptions(options: ISelectionOption[]): this {
    this.options.push(...options);
    return this;
  }

  setMinValues(min: number): this {
    this.minValues = min;
    return this;
  }

  setMaxValues(max: number): this {
    this.maxValues = max;
    return this;
  }

  build(): SelectComponent {
    if (!this.id) {
      throw new Error("SelectBuilder: 'id' is required.");
    }
    if (this.options.length === 0) {
      throw new Error("SelectBuilder: must have at least one option.");
    }

    return {
      type: EMessageComponentType.SELECT,
      id: this.id,
      component: {
        placeholder: this.placeholder,
        options: this.options,
        min_values: this.minValues,
        max_values: this.maxValues,
      },
    };
  }
}
