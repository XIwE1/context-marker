/**
 * 校验是否为有效的文本节点
 * @param root 容器节点
 * @param node 目标节点
 */
export function isValidTextNode(root: HTMLElement, node: Node) {
  return root.contains(node) && node.nodeType === 3;
}

/**
 * 校验是为否有效的选区
 * @param selection 用户选区
 */
export function isValidSelection(selection: Selection) {
  if (selection.isCollapsed || selection.getRangeAt(0).collapsed) return false;
  return true;
}

/**
 * 校验是否为有效的rect
 * @param rects 
 * @returns 
 */
export function isValidRects(rects: DOMRect[]) {
  if (rects.length === 1 && rects[0].width === 0 && rects[0].height === 0) {
    return false;
  }
  return true;
}