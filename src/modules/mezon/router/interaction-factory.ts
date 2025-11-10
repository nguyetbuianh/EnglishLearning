import { BaseHandler, InteractionEvent } from "../handlers/base";
import { getInteractionName } from "../decorators/interaction.decorator";
import { Type } from "@nestjs/common";

export class InteractionFactory {
  private readonly handlerMap = new Map<string, Type<BaseHandler<InteractionEvent>>>();

  constructor(handlers: BaseHandler<InteractionEvent>[]) {
    for (const handler of handlers) {
      const commandName = getInteractionName(handler.constructor);
      if (commandName) {
        this.handlerMap.set(commandName, handler.constructor as Type<BaseHandler<InteractionEvent>>);
      }
    }
  }

  getConstructor(eventName: string): Type<BaseHandler<InteractionEvent>> | undefined {
    return this.handlerMap.get(eventName);
  }
}