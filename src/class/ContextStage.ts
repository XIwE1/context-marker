import Konva from "konva";
import { IMarkerConfig } from "..";
import { RectPosition } from "../types/context";
import { KONVA_PREFIX } from "../types/enum";
import { IStage } from "../types/stage";

class Stage implements Partial<IStage> {
  private root: HTMLElement;
  private config: IMarkerConfig;

  private container: HTMLDivElement;
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private groups: Array<{
    id: string;
    group: Konva.Group;
    positions: RectPosition[];
  }> = [];

  constructor(root: HTMLElement, config: IMarkerConfig) {
    this.root = root;
    this.config = config;
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

  renderMarkItem(itemRects: DOMRect[], id: string, config: IMarkerConfig) {
    const { group, rectGroup, lineGroup } = this.createGroup(id, config);
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
      lineGroup.add(this.createLine(position, config));
    });
    this.groups.push({ id, group, positions });
    this.layer.add(group);
  }

  clear() {
    this.layer.destroyChildren();
    this.groups = [];
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

  private createContainer() {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.right = "0";
    el.style.bottom = "0";
    el.style.pointerEvents = "none";
    return el;
  }

  private getRootRectPosition() {
    return Object.assign(this.root.getBoundingClientRect(), {
      height: this.root.scrollHeight,
    });
  }
  private createGroup(id: string, config: IMarkerConfig) {
    const group = new Konva.Group({ id, x: 0, y: 0 });
    const rectGroup = new Konva.Group({
      id: KONVA_PREFIX.RECT_PREFIX + id,
      x: 0,
      y: 0,
      visible: false,
    });
    const lineGroup = new Konva.Group({
      id: KONVA_PREFIX.LINE_PREFIX + id,
      x: 0,
      y: 0,
      visible: true,
    });
    group.add(rectGroup);
    group.add(lineGroup);
    return { group, rectGroup, lineGroup };
  }

  private createRect(position: RectPosition, config: IMarkerConfig) {
    return new Konva.Rect({
      ...position,
      fill: config.rectFill,
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
}

export default Stage;
