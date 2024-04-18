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
export function isMobile() {
  return regMobile.test(window.navigator.userAgent);
}
