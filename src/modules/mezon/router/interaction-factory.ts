import { BaseHandler } from "../commands/base";
import { getInteractionName } from "../decorators/interaction.decorator";


export class InteractionFactory {
  private readonly interactionMap = new Map<string, BaseHandler>();

  constructor(handlers: BaseHandler[]) {
    for (const handler of handlers) {
      const commandName = getInteractionName(handler.constructor);
      if (commandName) {
        this.interactionMap.set(commandName, handler);
      }
    }
  }

  getHandler(rawInteraction: string): BaseHandler | null {
    if (!rawInteraction) return null;
    return this.interactionMap.get(rawInteraction) ?? null;
  }
}