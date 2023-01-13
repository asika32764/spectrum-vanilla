/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */

export function html(html: string) {
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

export function emit(ele: EventTarget, eventName: string, detail: any = {}) {
  const event = new CustomEvent(
    eventName,
    {
      detail
    }
  );

  ele.dispatchEvent(event);

  return event;
}

export function eventDelegate(
  ele: HTMLElement,
  eventName: string,
  selector: string,
  listener: Function,
  payload: { [name: string]: any } = {},
) {
  ele.addEventListener(eventName, (e) => {
    if ((e.target as Element).closest(selector)) {
      // @ts-ignore
      e.data = Object.assign({}, e.data || {}, payload);

      listener(e);
    }
  }, payload);
}
