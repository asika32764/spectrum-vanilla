export function html(html: string, doc = document) {
  const div = doc.createElement('div');
  div.innerHTML = html;
  return div.children[0];
}

export function camelize(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export function throttle(func: Function, wait: number, debounce: Function | undefined = undefined) {
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
  const classes = className.split(' ').filter((c) => c !== '');

  if (className !== '' && classes.length) {
    ele.classList.add(...classes);
  }
  return ele;
}

export function removeClass(ele: HTMLElement, className: string) {
  const classes = className.split(' ').filter((c) => c !== '');
  if (className !== '' && classes.length) {
    ele.classList.remove(...classes);
  }
  return ele;
}

export function toggleClass(
  ele: HTMLElement,
  className: string,
  state: boolean | undefined = undefined
) {
  if (state != undefined) {
    ele.classList.toggle(className, state);
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
      cancelable: true,
      bubbles: true,
      detail,
    },
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

export type OffsetCSSOptions = { top?: number, bottom?: number, left?: number, right?: number, using?: Function };

export function setElementOffset(
  elem: HTMLElement,
  options: OffsetCSSOptions,
) {
  let curPosition;
  let curTop;
  let curLeft;
  let calculatePosition;
  let position = elem.style.position;
  let curElem = elem;
  let props: OffsetCSSOptions = {};

  // Set position first, in-case top/left are set even on static elem
  if (position === "static") {
    elem.style.position = "relative";
  }

  let curOffset = getElementOffset(curElem);
  let curCSSTop = elem.style.top;
  let curCSSLeft = elem.style.left;
  calculatePosition = (position === "absolute" || position === "fixed") &&
    (curCSSTop + curCSSLeft).indexOf("auto") > -1;

  // Need to be able to calculate position if either
  // top or left is auto and position is either absolute or fixed
  if (calculatePosition) {
    curPosition = getElementPosition(curElem);
    curTop = curPosition.top;
    curLeft = curPosition.left;

  } else {
    curTop = parseFloat(curCSSTop) || 0;
    curLeft = parseFloat(curCSSLeft) || 0;
  }

  // if (typeof options === 'function') {
  //   options = options.call(elem, Object.assign({}, curOffset)) as OffsetCSSOptions;
  // }

  if (options.top != null) {
    props.top = (options.top - curOffset.top) + curTop;
  }
  if (options.left != null) {
    props.left = (options.left - curOffset.left) + curLeft;
  }
  
  if ("using" in options) {
    options.using.call(elem, props);
  } else {
    for (const k in props) {
      curElem.style.setProperty(k, props[k as keyof typeof props] + 'px');
    }
  }
}

export function getElementOffset(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const docElem = document.documentElement;
  return {
    top: box.top + window.pageYOffset - docElem.clientTop,
    left: box.left + window.pageXOffset - docElem.clientLeft,
  };
}

export function getElementPosition(el: HTMLElement) {
  const { top, left } = el.getBoundingClientRect();
  const { marginTop, marginLeft } = getComputedStyle(el);
  return {
    top: top - parseInt(marginTop, 10),
    left: left - parseInt(marginLeft, 10),
  };
}
