import { IFactory, IMarkItem, IMarkerConfig, MarkNode } from "../types/context";
import {
  // getRangeStartEndText,
  getRectsByNode,
  getWithinTextNodes,
} from "../util/selection";
import { uuid } from "../util/uuid";
import { isValidRects, isValidSelection, isValidTextNode } from "../util/valid";

class ContextFactory implements IFactory {
  private root: HTMLElement;
  private config: IMarkerConfig;
  constructor(root: HTMLElement, config: IMarkerConfig) {
    this.root = root;
    this.config = config;
  }

  createSelectionItem(selection: Selection): IMarkItem | null {
    if (!isValidSelection(selection)) return null;
    const range = selection.getRangeAt(0);
    const {
      startContainer: start,
      startOffset,
      endContainer: end,
      endOffset,
    } = range;

    // if (!isValidTextNode(this.root, start) || !isValidTextNode(this.root, end))
    //   return null;

    const startPath = this.getPath(start);
    const endPath = start === end ? startPath : this.getPath(end);

    if (!startPath || !endPath) return null;

    // const { startText, endText } = getRangeStartEndText(range);
    const startNode: MarkNode = {
      path: startPath,
      offset: startOffset,
      // text: startText,
    };
    const endNode: MarkNode = {
      path: endPath,
      offset: endOffset,
      // text: endText,
    };
    return {
      // id: uuid(8),
      // text: selection.toString(),
      length: selection.toString().length,
      startNode,
      endNode,
      lineVisible: true,
      rectVisible: false,
      config: this.config,
    };
  }

  createItemRects(markItem: IMarkItem) {
    const rects: DOMRect[] = [];
    const {
      startNode: { path: startPath, offset: startOffset },
      endNode: { path: endPath, offset: endOffset },
    } = markItem;
    const startNode = this.getNodeByPath(startPath)!;
    const endNode = this.getNodeByPath(endPath)!;

    if (startNode === endNode) {
      rects.push(...getRectsByNode(startNode, startOffset, endOffset));
    } else {
      const nodes = getWithinTextNodes(this.root, startNode, endNode);
      rects.push(...getRectsByNode(startNode, startOffset));
      rects.push(...getRectsByNode(endNode, 0, endOffset));
      for (let nodeItem of nodes) {
        const nodeRects = getRectsByNode(nodeItem);
        if (!isValidRects(nodeRects)) continue;
        rects.push(...nodeRects);
      }
    }

    return rects.map((rectItem) => {
      rectItem.y += this.root.scrollTop;
      rectItem.x += this.root.scrollLeft;
      rectItem.height += 1;
      return rectItem;
    });
  }

  /**
   * 获取对应节点的path
   * @param textNode
   */
  private getPath(textNode: Node) {
    const path = [0];
    let parentNode = textNode.parentNode;
    let cur: Node = textNode;

    while (parentNode) {
      if (cur === parentNode.firstChild) {
        if (parentNode === this.root) {
          break;
        } else {
          cur = parentNode;
          parentNode = cur.parentNode;
          path.unshift(0);
        }
      } else {
        cur = cur.previousSibling!;
        path[0]++;
      }
    }

    return parentNode ? path : null;
  }

  /**
   * 根据节点路径获取对应节点
   * @param path
   */
  private getNodeByPath(path: number[]) {
    let node: Node = this.root;
    for (let pathIndex of path) {
      if (!node?.childNodes?.[pathIndex]) {
        return null;
      }
      node = node.childNodes[pathIndex];
    }
    return node;
  }
}

export default ContextFactory;
