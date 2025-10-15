import { getInteractionName } from "../decorators/interaction.decorator";
import { InteractionHandler } from "../utils/interaction-handler.abstract";


export class InteractionFactory {
  private readonly interactionMap = new Map<string, InteractionHandler>();

  constructor(handlers: InteractionHandler[]) {
    for (const handler of handlers) {
      const commandName = getInteractionName(handler.constructor);
      if (commandName) {
        this.interactionMap.set(commandName, handler);
      }
    }
  }

  getHandler(rawInteraction: string): InteractionHandler | null {
    if (!rawInteraction) return null;
    return this.interactionMap.get(rawInteraction) ?? null;
  }
}