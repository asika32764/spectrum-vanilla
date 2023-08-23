export declare function html(html: string, doc?: Document): Element;
export declare function camelize(str: string): string;
export declare function throttle(func: Function, wait: number, debounce?: Function | undefined): () => void;
export declare function addClass(ele: HTMLElement, className: string): HTMLElement;
export declare function removeClass(ele: HTMLElement, className: string): HTMLElement;
export declare function toggleClass(ele: HTMLElement, className: string, state?: boolean | undefined): HTMLElement;
export declare function emit(ele: EventTarget, eventName: string, detail?: any): CustomEvent<any>;
export declare function eventDelegate(ele: HTMLElement, eventName: string, selector: string, listener: Function, payload?: {
    [name: string]: any;
}): void;
export type OffsetCSSOptions = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    using?: Function;
};
export declare function setElementOffset(elem: HTMLElement, options: OffsetCSSOptions): void;
export declare function getElementOffset(el: HTMLElement): {
    top: number;
    left: number;
};
export declare function getElementPosition(el: HTMLElement): {
    top: number;
    left: number;
};
