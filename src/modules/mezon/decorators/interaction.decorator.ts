export const interactionRegistry = new Map<Function, string>();

export function interaction(interactionName: string): ClassDecorator {
  return (target: Function) => {
    interactionRegistry.set(target, interactionName);
  };
}

export function getInteractionName(target: Function): string | undefined {
  return interactionRegistry.get(target);
}
