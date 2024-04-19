import { UserEvent } from "../types/enum";
import { IInteraction } from "../types/types";

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 100
) {
  let timerId: number | undefined;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * 判断agent是否为移动端
 */
const regMobile =
  /Android|iPhone|BlackBerry|BB10|Opera Mini|Phone|Mobile|Silk|Windows Phone|Mobile(?:.+)Firefox\b/i;
export function detectMobile() {
  return regMobile.test(window.navigator.userAgent);
}

export function getInteraction(): IInteraction {
  const isMobile = detectMobile();
  const interaction = {
    PointerEnd: isMobile ? UserEvent.touchend : UserEvent.mouseup,
    PointerTap: isMobile ? UserEvent.touchstart : UserEvent.click,
    // hover and click will be the same event in mobile
    PointerOver: isMobile ? UserEvent.touchstart : UserEvent.mouseover,
};

return interaction;

  
}