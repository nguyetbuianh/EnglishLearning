import { OptionEnum } from "../enum/option.enum";

export function parseOption(option: string): OptionEnum | null {
  return Object.values(OptionEnum).includes(option as OptionEnum)
    ? (option as OptionEnum)
    : null;
}
