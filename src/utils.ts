/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */

export function html(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children[0];
}

export function camelize(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export function throttle(func: Function, wait: number, debounce: Function|undefined = undefined) {
  let timeout: any;
  return function () {
    // @ts-ignore
    const context = this, args = arguments;
    const throttler = function () {
      timeout = null;
      func.apply(context, args);
    };
    if (debounce) clearTimeout(timeout);
    if (debounce || !timeout) {
      timeout = setTimeout(throttler, wait);
    }
  };
}

export function addClass(ele: HTMLElement, className: string) {
  const classes = className.split(' ');
  ele.classList.add(...classes);
  return ele;
}

export function removeClass(ele: HTMLElement, className: string) {
  const classes = className.split(' ');
  ele.classList.remove(...classes);
  return ele;
}

export function toggleClass(ele: HTMLElement, className: string, state: boolean|undefined = undefined) {
  if (state != undefined) {
    ele.classList.toggle(className);
  } else if (state === true) {
    addClass(ele, className);
  } else {
    removeClass(ele, className);
  }
  return ele;
}
