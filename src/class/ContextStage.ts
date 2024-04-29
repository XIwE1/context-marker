import Konva from "konva";
import { IMarkerConfig, RectPosition } from "../types/context";
import { KONVA_PREFIX } from "../types/enum";
import { IStage } from "../types/stage";

export type StageGroup = {
  id: string;
  group: Konva.Group;
  positions: RectPosition[];
};

class Stage implements IStage {
  private root: HTMLElement;

  private container: HTMLDivElement;
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private stageGroups: Array<StageGroup> = [];

  constructor(root: HTMLElement) {
    this.root = root;
    this.container = this.createContainer();
    root.appendChild(this.container);

    const { width, height } = this.getRootRectPosition();
    this.stage = new Konva.Stage({
      container: this.container,
      width,
      height,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  renderItem(
    itemRects: DOMRect[],
    id: string,
    config: IMarkerConfig,
    lineVisible: boolean,
    rectVisible: boolean
  ) {
    const { group, rectGroup, lineGroup } = this.createGroup(
      id,
      lineVisible,
      rectVisible
    );
    const { top, left } = this.getRootRectPosition();
    const positions: RectPosition[] = [];
    itemRects.forEach((rectItem) => {
      const x = rectItem.left - left;
      const y = rectItem.top - top;
      const position = {
        x,
        y,
        width: rectItem.width,
        height: rectItem.height,
      };
      // 记录划线的位置 - 可能为多行
      positions.push(position);
      rectGroup.add(this.createRect(position, config));
      lineGroup.add(this.computedLineShape(config.lineShape)(position, config));
    });
    this.stageGroups.push({ id, group, positions });
    this.layer.add(group);
  }

  deleteItem(id: string | number): boolean {
    const index = this.stageGroups.findIndex((item) => item.id === '' + id);
    if (index === -1) return false;
    this.stageGroups.splice(index, 1);
    const group = this.layer.find("#" + id)[0];
    group && group.destroy();
    return true;
  }

  clear() {
    this.layer.destroyChildren();
    this.stageGroups = [];
  }

  destory(): void {
    this.layer.destroy();
    this.stage.destroy();
    this.container.remove();
  }

  updateStageSize() {
    const { width, height } = this.getRootRectPosition();
    this.stage.setSize({ width, height });
  }
  getAllGroupIdByPointer(x: number, y: number): string[] {
    const { top, left } = this.getRootRectPosition();
    x = x - left;
    y = y - top;
    return this.stageGroups
      .filter((groupItem) => {
        return groupItem.positions.some((rect) => {
          return (
            x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
          );
        });
      })
      .map((item) => item.group.id());
  }

  getAboveGroupIdByRect(startRect: DOMRect, endRect: DOMRect): string[] {
    const { top, left } = this.getRootRectPosition();
    const _startRect = {
      ...startRect,
      x: startRect.x - left,
      y: startRect.y,
    };
    const _endRect = {
      ...endRect,
      x:
        startRect.y === endRect.y
          ? endRect.x + endRect.width - left
          : endRect.x - left,
      y: endRect.y,
    };
    const filterItems = this.stageGroups.filter((groupItem) => {
      const isAbove = this.isItemAboveRect(groupItem, _startRect, _endRect);
      return isAbove;
    });
    return filterItems.map((item) => item.group.id());
  }

  getStageItemById(id: string) {
    return this.stageGroups.find((i) => i.id === id);
  }

  addClass(className: string) {
    this.container.classList.add(className);
  }

  removeClass(className: string) {
    this.container.classList.remove(className);
  }

  // rect是否在item之中
  private isItemAboveRect(
    groupItem: StageGroup,
    startRect: DOMRect,
    endRect: DOMRect
  ) {
    const startPosition = groupItem.positions[0];
    const lastPosition = groupItem.positions[groupItem.positions.length - 1];
    const endPosition = {
      ...lastPosition,
      x: lastPosition.x + lastPosition.width,
    };
    // 排除 item是单行 而rect不是
    if (groupItem.positions.length === 1 && startRect.y !== endRect.y)
      return false;
    // 排除 小于start.y 大于end.y
    if (startPosition.y > startRect.y) return false;
    if (endPosition.y < endRect.y) return false;
    // 筛选 在start.y 和 end.y 之间
    if (startPosition.y < startRect.y && endPosition.y > endRect.y) return true;
    // 筛选 等于start.y 且 大于等于start.x
    if (startPosition.y === startRect.y) {
      if (startPosition.x > startRect.x) return false;
      if (endPosition.y > endRect.y) return true;
      if (endPosition.y === endRect.y) return endPosition.x >= endRect.x;
    }
    if (endPosition.y === endRect.y && endPosition.x >= endRect.x) return true;
    return false;
  }

  private createContainer() {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.right = "0";
    el.style.bottom = "0";
    el.style.pointerEvents = "none";
    el.style.zIndex = "-1";
    return el;
  }

  private getRootRectPosition() {
    return Object.assign(this.root.getBoundingClientRect(), {
      height: this.root.scrollHeight,
    });
  }
  private createGroup(id: string, lineVisible: boolean, rectVisible: boolean) {
    const group = new Konva.Group({ id, x: 0, y: 0 });
    const rectGroup = new Konva.Group({
      id: KONVA_PREFIX.RECT_PREFIX + id,
      x: 0,
      y: 0,
      visible: rectVisible,
    });
    const lineGroup = new Konva.Group({
      id: KONVA_PREFIX.LINE_PREFIX + id,
      x: 0,
      y: 0,
      visible: lineVisible,
    });
    group.add(rectGroup);
    group.add(lineGroup);
    return { group, rectGroup, lineGroup };
  }

  private computedLineShape(type?: string) {
    if (type === "dash") return this.createDashLine;
    if (type === "wave") return this.createWaveLine;
    return this.createLine;
  }

  private createRect(position: RectPosition, config: IMarkerConfig) {
    return new Konva.Rect({
      ...position,
      height: position.height + 1,
      fill: config.rectFill,
    });
  }
  private createWaveLine(position: RectPosition, config: IMarkerConfig) {
    const { x, y, width, height } = position;
    const waveWidth = 12; // 波浪的宽度
    const waveHeight = 2; // 波浪线的高度
    const numWaves = Math.ceil(width / waveWidth); // 根据给定的宽度计算波浪的数量
    const step = width / numWaves;

    let pathData = `M${x},${y + height}`;
    for (let i = 0; i < numWaves; i++) {
      if (i % 2 === 0) {
        pathData += `q${step / 2},${waveHeight} ${step},0`;
      } else {
        pathData += `q${step / 2},-${waveHeight} ${step},0`;
      }
    }

    return new Konva.Path({
      data: pathData,
      stroke: config.lineStroke,
      strokeWidth: config.lineWidth,
    });
  }

  private createLine(position: RectPosition, config: IMarkerConfig) {
    const { x, y, width, height } = position;
    return new Konva.Line({
      points: [x, y + height, x + width, y + height],
      stroke: config.lineStroke,
      strokeWidth: config.lineWidth,
    });
  }

  private createDashLine(position: RectPosition, config: IMarkerConfig) {
    const { x, y, width, height } = position;
    return new Konva.Line({
      points: [x, y + height, x + width, y + height],
      stroke: config.lineStroke,
      strokeWidth: config.lineWidth,
      dash: [7, 7],
    });
  }
}

export default Stage;
