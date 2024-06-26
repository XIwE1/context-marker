import { IContextMarker, IMarkItem, IMarkerConfig } from "../types/context";
import ContextFactory from "./ContextFactory";
import { defaultMarkerConfig } from "../config";
import { isValidSelection, isValidTextNode } from "../util/valid";
import Stage from "./ContextStage";
import { debounce, getInteraction } from "../util";
import EventEmitter from "./event.emitter";
import { EventHandlerMap } from "../types/types";
import { EventType } from "../types/enum";
import { isSameNode } from "../util/selection";

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

  render(item: IMarkItem, isClear = true) {
    const itemRects = this.factory.createItemRects(item);
    if (itemRects.length === 0) return false;

    this.add(item);
    const { id, config, lineVisible, rectVisible } = item;

    // this.stage.renderItem(itemRects, id, this.marker);
    this.stage.renderItem(
      itemRects,
      "" + id,
      {
        ...defaultMarkerConfig,
        ...config,
      },
      lineVisible ?? true,
      rectVisible ?? false
    );
    isClear && this.clearSelection();
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

  highlight(isHightlight: boolean, id: string | number) {
    if (!id) return false;
    const targetItem = [...this.items].find((item) => item.id === id);
    if (!targetItem) return false;
    targetItem.rectVisible = isHightlight;
    targetItem.lineVisible = !isHightlight;
    this.stage.deleteItem(id);
    this.render(targetItem, false);
    return true;
  }

  delete(id: string) {
    if (!id) return false;
    const targetItem = [...this.items].find((item) => item.id === id);
    if (!targetItem) return false;
    this.items.delete(targetItem);
    return this.stage.deleteItem(id);
  }
  // search
  getSelectionItem(selection?: Selection | null) {
    const _selection = selection || window.getSelection();
    if (!_selection || !isValidSelection(_selection)) return null;
    return this.factory.createSelectionItem(_selection);
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
    const stageItem = this.stage.getStageItemById("" + item.id);
    if (!stageItem?.positions?.length) return null;
    return stageItem.positions.map((rectItem) => {
      rectItem.y += this.root.scrollTop;
      rectItem.x += this.root.scrollLeft;
      return rectItem;
    });
  }

  getItemsByPointer(x: number, y: number) {
    const ids = this.stage.getAllGroupIdByPointer(x, y);
    if (!ids?.length) return [];
    const filterItems = Array.from(this.items).filter((item) =>
      ids.includes("" + item.id)
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

  addStageClass(className: string) {
    this.stage.addClass(className);
  }

  removeStageClass(className: string) {
    this.stage.removeClass(className);
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
        const { startNode, endNode } = markItem;
        let samePathItems: IMarkItem[] = [];
        samePathItems = [...this.items].filter(
          (curItem) =>
            curItem.length === markItem.length &&
            isSameNode(startNode, curItem.startNode) &&
            isSameNode(endNode, curItem.endNode)
        );
        // 如果没有完全相同路径的标记，自身可能是其他标记的一部分
        if (!samePathItems.length && markRects?.length) {
          const groupIds = this.stage.getAboveGroupIdByRect(
            markRects[0],
            markRects[1]
          );
          samePathItems = [...this.items].filter((curItem) =>
            groupIds.includes("" + curItem.id)
          );
        }
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
