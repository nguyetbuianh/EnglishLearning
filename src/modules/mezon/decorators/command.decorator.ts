import 'reflect-metadata';

export const COMMAND_METADATA = 'command:metadata';

export function Command(commandName: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(COMMAND_METADATA, commandName, target);
  };
}

export function getCommandMetadata(target: Function): string | undefined {
  return Reflect.getMetadata(COMMAND_METADATA, target);
}