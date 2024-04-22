import Konva from "konva";
import { IMarkerConfig, RectPosition } from "./context";
import { StageGroup } from "../class/ContextStage";

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
  renderItem(itemRects: DOMRect[], id: string, config: IMarkerConfig, lineVisible: boolean, rectVisible: boolean): void;
  /**
   * 删除对应id的标记
   * @param id
   */
  deleteItem(id: string): boolean;
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
   * 获取对应id在画布中的元素
   * @param id
   */
  getStageItemById(id: string): StageGroup | undefined;
  /**
   * 更新画布大小
   */
  updateStageSize(): void;
}
