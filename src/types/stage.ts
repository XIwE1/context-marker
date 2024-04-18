import { IMarkerConfig, RectPosition } from "./context";

/**
 * 画布抽象类
 */
export interface IStage {
  /**
   * 根据画笔配置 标记位置 渲染标记
   * @param domRects
   * @param id
   * @param config
   */
  renderMarkItem(itemRects: DOMRect[], id: string, config: IMarkerConfig): void;
  /**
   * 删除对应id的标记
   * @param id
   */
  deleteMarkItem(id: string): boolean;
  /**
   * 清空画布
   */
  clear(): void;
  /**
   * 销毁画布
   */
  destory(): void;
  /**
   * 获取点击位置的所有id
   * @param x
   * @param y
   */
  getAllGroupIdByPointer(x: number, y: number): string[];
  /**
   * 获取对应id的标记位置
   * @param id
   */
  getItemPositionById(id: string): RectPosition;
  /**
   * 更新画布大小
   */
  updateStageSize(): void;
}
