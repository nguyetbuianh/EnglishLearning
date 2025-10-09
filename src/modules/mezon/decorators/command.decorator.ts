import "reflect-metadata";

export const COMMAND_METADATA_KEY = Symbol("command");

export function Command(name: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(COMMAND_METADATA_KEY, name, target);
  };
}

export function getCommandName(target: any): string | undefined {
  return Reflect.getMetadata(COMMAND_METADATA_KEY, target);
}
