import { isValidTextNode } from "./valid";

// 获取range头尾节点的文本
export function getRangeStartEndText(range: Range) {
  const { startContainer, endContainer, startOffset, endOffset } = range;
  let startText, endText;
  if (startContainer === endContainer) {
    startText = startContainer.textContent?.slice(startOffset, endOffset) || "";
    endText = startText;
  } else {
    startText = startContainer.textContent?.slice(startOffset) || "";
    endText = endContainer.textContent?.slice(0, endOffset) || "";
  }
  return {
    startText: range.startContainer.textContent || "",
    endText: range.endContainer.textContent || "",
  };
}

/**
 * 获取节点和偏移量对应的 DOMRect
 * @param node
 * @param startOffset
 * @param endOffset
 * @returns
 */
export function getRectsByNode(
  node: Node,
  startOffset?: number,
  endOffset?: number
) {
  if (startOffset === undefined) startOffset = 0;
  if (endOffset === undefined) endOffset = node.textContent!.length;

  const range = document.createRange();
  range.setStart(node, startOffset);
  range.setEnd(node, endOffset);
  // getClientRects - 内容可能是多行
  return Array.from(range.getClientRects());
}

// /**
//  * 获取 节点对应位置的 DOMRect
//  * @param node
//  * @param offset
//  * @returns
//  */
// export function getCharRect(node: Text, offset: number) {
//   const range = document.createRange();
//   range.setStart(node, offset);
//   range.setEnd(
//     node,
//     offset + 1 > node.textContent!.length ? offset : offset + 1
//   );
//   return range.getBoundingClientRect();
// }

/**
 * 获得range之间的所有文本节点
 * @param root
 * @param start startContainer
 * @param end endContainer
 * @returns
 */
export function getWithinTextNodes(root: HTMLElement, start: Node, end: Node) {
  if (!root.contains(start) || !root.contains(end)) {
    throw Error("[ERROR] - start or end node not in root");
  }
  const nodeStack: Node[] = [root];
  const textNodes = [];
  let withinRange = false;
  let curNode = null;
  while (nodeStack.length) {
    curNode = nodeStack.pop() as Node;
    const childs = [...curNode.childNodes].reverse();
    nodeStack.push(...childs);
    if (curNode === start) withinRange = true;
    else if (curNode === end) break;
    else if (withinRange && isValidTextNode(root, curNode))
      textNodes.push(curNode);
  }
  return textNodes;
}
