import { EventType, UserEvent } from "./enum";

export interface IInteraction {
  PointerEnd: UserEvent;
  PointerTap: UserEvent;
  PointerOver: UserEvent;
}

export interface EventHandlerMap {
  [key: string]: (...args: any[]) => void;
  [EventType.CLICK]: (data: { id: string }, e: MouseEvent | TouchEvent) => void;
  [EventType.HOVER]: (data: { id: string }, e: MouseEvent | TouchEvent) => void;
  [EventType.HOVER_OUT]: (
    data: { id: string },
    e: MouseEvent | TouchEvent
  ) => void;
  [EventType.CREATE]: (data: {}) => void;
  [EventType.REMOVE]: (data: { ids: string[] }) => void;
}
