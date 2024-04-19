import { IContextMarker, IMarkItem, IMarkerConfig } from "../types/context";
import ContextFactory from "./ContextFactory";
import { defaultMarkerConfig } from "../config";
import { isValidSelection, isValidTextNode } from "../util/valid";
import Stage from "./ContextStage";
import { debounce, getInteraction } from "../util";
import EventEmitter from "./event.emitter";
import { EventHandlerMap } from "../types/types";
import { EventType } from "../types/enum";
import { isSamePath } from "../util/selection";

const AOLLOWED_TYPES = ["absolute", "fixed", "relative"];

class ContextMarker
  extends EventEmitter<EventHandlerMap>
  implements Partial<IContextMarker>
{
  static event = EventType;
  private root: HTMLElement;
  private factory: ContextFactory;
  private stage: Stage;
  private items: Set<IMarkItem> = new Set();
  private readonly event = getInteraction();

  marker: IMarkerConfig;
  constructor(root: HTMLElement, config?: IMarkerConfig) {
    super();
    const position = window.getComputedStyle(root).getPropertyValue("position");
    if (!AOLLOWED_TYPES.includes(position)) {
      console.error(
        '[ERROR] - root style position must be one of "absolute", "fixed", "relative"'
      );
    }

    this.root = root;
    this.marker = { ...defaultMarkerConfig, ...config };
    this.factory = new ContextFactory(this.root, this.marker);
    this.stage = new Stage(this.root);
    this.observeResize();
    this.observeClick();
    this.observerPointerEnd();
  }

  render(item: IMarkItem) {
    const itemRects = this.factory.createItemRects(item);
    if (itemRects.length === 0) return false;

    this.add(item);
    const { id, config } = item;
    // this.stage.renderItem(itemRects, id, this.marker);
    this.stage.renderItem(itemRects, id, { ...defaultMarkerConfig, ...config });
    this.clearSelection();
    return true;
  }

  add(item: IMarkItem) {
    if (this.items.has(item)) return false;
    this.store(item);
    this.items.add(item);
    return true;
  }
  store(item: IMarkItem) {
    this.emit(EventType.CREATE, item);
  }
  restore(sources: IMarkItem[]) {
    sources.forEach((sourceItem) => {
      this.items.add(sourceItem);
      this.render(sourceItem);
    });
  }

  highlight(isHightlight: boolean, id: string) {
    if (!id) return false;
    const targetItem = [...this.items].find((item) => item.id === id);
    if (!targetItem) return false;
    targetItem.rectVisible = isHightlight;
    return true;
  }

  // delete
  // search
  getSelectionItem(selection?: Selection | null) {
    selection = selection || window.getSelection();
    if (!selection || !isValidSelection(selection)) return null;
    const markItem = this.factory.createSelectionItem(selection);
    return markItem;
  }

  getSelectionRect(selection?: Selection | null) {
    selection = selection || window.getSelection();
    if (!selection || !isValidSelection(selection)) return null;
    const range = selection.getRangeAt(0);
    // const { startContainer, endContainer } = range;
    // if (
    //   !isValidTextNode(this.root, startContainer) ||
    //   !isValidTextNode(this.root, endContainer)
    // )
    //   return null;

    const DOMRects = Array.from(range.getClientRects()).map((item) => {
      const { left, top, width, height, x, y } = item;
      return {
        ...item,
        left,
        top,
        width,
        height,
        x,
        y:
          y -
          this.root.offsetTop +
          document.documentElement.scrollTop +
          this.root.scrollTop,
      };
    });
    return [DOMRects[0], DOMRects[DOMRects.length - 1]];
  }

  getItemPosition(item: IMarkItem) {
    const rects = this.stage.getItemPositionById(item.id);
    if (!rects?.length) return null;
    return rects.map((rectItem) => {
      rectItem.y += this.root.scrollTop;
      rectItem.x += this.root.scrollLeft;
      return rectItem;
    });
  }

  getItemsByPointer(x: number, y: number) {
    const ids = this.stage.getAllGroupIdByPointer(x, y);
    if (!ids?.length) return [];
    const filterItems = Array.from(this.items).filter((item) =>
      ids.includes(item.id)
    );
    return filterItems;
  }

  updateMarkerConfig(config?: IMarkerConfig) {
    this.marker = { ...defaultMarkerConfig, ...config };
    this.factory = new ContextFactory(this.root, this.marker);
  }
  clearStage() {
    this.stage.clear();
  }
  destoryStage() {
    this.stage.destory();
  }

  private observeResize() {
    const observer = new ResizeObserver(debounce(this.handleResize.bind(this)));
    observer.observe(this.root);
  }

  private observerPointerEnd() {
    this.root.addEventListener(this.event.PointerEnd, () => {
      setTimeout(() => {
        const markItem = this.getSelectionItem();
        if (!markItem) return this.emit(this.event.PointerEnd, null);

        const markRects = this.getSelectionRect();
        const {
          startNode: { path: startPath },
          endNode: { path: endPath },
        } = markItem;
        const samePathItems: IMarkItem[] = [];
        this.items.forEach((targetItem) => {
          if (
            targetItem.length === markItem.length &&
            isSamePath(startPath, targetItem.startNode.path) &&
            isSamePath(endPath, targetItem.endNode.path)
          ) {
            samePathItems.push(targetItem);
          }
        });
        this.emit(this.event.PointerEnd, markItem, samePathItems, markRects);
      });
    });
  }
  private observeClick() {
    this.root.addEventListener("click", (e) => {
      setTimeout(() => {
        this.emit(
          EventType.CLICK,
          this.getItemsByPointer(e.clientX, e.clientY),
          e
        );
      });
    });
  }

  private handleResize() {
    this.clearStage();
    this.stage.updateStageSize();
    this.items.forEach((item) => this.render(item));
  }

  private clearSelection() {
    if (window.getSelection) {
      if (window.getSelection()?.empty) {
        // Chrome
        window.getSelection()?.empty();
      } else if (window.getSelection()?.removeAllRanges) {
        // Firefox
        window.getSelection()?.removeAllRanges();
      }
    }
  }
}

export default ContextMarker;
