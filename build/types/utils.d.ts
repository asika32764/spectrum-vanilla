/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */
export declare function html(html: string): Element;
export declare function camelize(str: string): string;
export declare function throttle(func: Function, wait: number, debounce?: Function | undefined): () => void;
export declare function addClass(ele: HTMLElement, className: string): HTMLElement;
export declare function removeClass(ele: HTMLElement, className: string): HTMLElement;
export declare function toggleClass(ele: HTMLElement, className: string, state?: boolean | undefined): HTMLElement;
export declare function emit(ele: EventTarget, eventName: string, detail?: any): CustomEvent<any>;
export declare function eventDelegate(ele: HTMLElement, eventName: string, selector: string, listener: Function, payload?: {
    [name: string]: any;
}): void;
