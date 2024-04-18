export enum EventType {
  CREATE = "selection:create",
  REMOVE = "selection:remove",
  MODIFY = "selection:modify",
  HOVER = "selection:hover",
  HOVER_OUT = "selection:hover-out",
  CLICK = "selection:click",
}

export enum LineType {
    CREATE = "selection:create",
    REMOVE = "selection:remove",
    MODIFY = "selection:modify",
    HOVER = "selection:hover",
    HOVER_OUT = "selection:hover-out",
    CLICK = "selection:click",
  }

export enum UserEvent {
  touchend = "touchend",
  mouseup = "mouseup",
  touchstart = "touchstart",
  click = "click",
  mouseover = "mouseover",
}

export enum KONVA_PREFIX {
  RECT_PREFIX = "rect-",
  LINE_PREFIX = "line-",
  SHAPE_PREFIX = "shape-",
}
