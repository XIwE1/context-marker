/**
 * 工厂抽象类
 */
export interface IFactory {
  /**
   * 根据selection生成MarkItem 用于数据
   * @param selection
   */
  createSelectionItem(selection: Selection): IMarkItem | null;
  /**
   * 根据MarkItem生成rects 用于渲染
   * @param markItem
   */
  createItemRects(markItem: IMarkItem): DOMRect[];
}

// export type RectPosition = Partial<DOMRect>;
export type RectPosition = Pick<DOMRect, "x" | "y" | "width" | "height">;

/**
 * 画笔配置
 */
export interface IMarkerConfig {
  // 矩形默认填充颜色
  rectFill: string;
  // 线段默认填充颜色
  lineStroke: string;
  // 线段默认的宽度
  lineWidth: number;
  lineShape?: string;
  // canvas 渲染像素比
  pixelRatio?: number;
}

// export interface IMarkConfig {
//   rect: {
//     fill: string;
//   };
//   line: {
//     stroke: string;
//     strokeWidth: number;
//   };
// }

/**
 * 标记节点的信息，路径 偏移量 文本
 */
export type MarkNode = {
  path: number[];
  offset: number;
  // text: string;
};

/**
 * 标记操作的信息，id 文本 起始节点 画笔配置 线段/背景是否可见 操作人id
 */
export interface IMarkItem {
  id?: string;
  // text: string;
  length: number;
  startNode: MarkNode;
  endNode: MarkNode;
  config: IMarkerConfig;
  lineVisible?: boolean;
  rectVisible?: boolean;
  create_at?: number;
  operator?: string;
  [key: string]: any;
}

export interface IContextMarker {
  /**
   * 获取selection对应的MarkItem
   * @param selection
   */
  getSelectionItem(selection: Selection): IMarkItem | null;
  /**
   * 获取selection对应start和end节点的位置
   * @param selection
   */
  getSelectionRect(selection?: Selection | null): DOMRect[] | null;
  /**
   * 更新画笔的配置
   * @param config 画笔配置
   */
  updateMarkerConfig(config: IMarkerConfig): void;
  /**
   * 渲染标记项
   */
  render(markItem: IMarkItem): boolean;
  /**
   * 添加标记项
   */
  add(markItem: IMarkItem): boolean;
  /**
   * 删除对应id的标记项
   */
  delete(id: string): boolean;
  /**
   * 获取对应id的标记项
   * @param id
   */
  search(id: string): IMarkItem | null;
  /**
   * 将标记项持久化
   */
  store(item: IMarkItem): void;
  /**
   * 根据持久化信息恢复标记
   */
  restore(items: IMarkItem[]): void;
  /**
   * 高亮/取消高亮 指定id的区域
   */
  highlight(isHightlight: boolean, id: string): boolean;
  /**
   * 根据鼠标位置获取相应的所有标记
   */
  getItemsByPointer(x: number, y: number): Partial<IMarkItem>[];
  /**
   * 获取对应item的rect位置
   */
  getItemPosition(item: IMarkItem): RectPosition[] | null;
  /**
   * 清空画布
   */
  clearStage(): void;
}
