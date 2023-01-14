/// <reference types="jquery" />
/// <reference types="jquery" />
import { ColorInput } from 'tinycolor2';
import { Options, SpLang, SpListener } from './types';
import { OffsetCSSOptions } from './utils';
/**
 * Lightweight drag helper.  Handles containment within the element, so that
 * when dragging, the x is within [0,element.width] and y is within [0,element.height]
 */
declare function draggable(element: HTMLElement, onmove: (x: number, y: number, e: DragEvent) => void, onstart: (x: number, y: number, e: DragEvent) => void, onstop: (x: number, y: number, e: DragEvent) => void): void;
export default class Spectrum {
    private spectrum;
    ele: HTMLInputElement;
    options: Partial<Options>;
    eventListeners: {
        [event: string]: EventListener[];
    };
    static defaultOptions: Partial<Options>;
    static draggable: typeof draggable;
    static localization: {
        [locale: string]: SpLang;
    };
    static palette: string[][];
    static create(selector: string | HTMLElement, options?: Partial<Options>): Spectrum;
    static createIfExists(selector: string | HTMLElement, options?: Partial<Options>): Spectrum | null;
    static getInstance(selector: string | HTMLElement, options?: Partial<Options>): Spectrum;
    static hasInstance(selector: string | HTMLElement): boolean;
    static createMultiple(selector: string | NodeListOf<HTMLElement>, options?: Partial<Options>): Spectrum[];
    static getInstanceMultiple(selector: string | JQuery | NodeListOf<HTMLElement>, options?: Partial<Options>): Spectrum[];
    private static wrap;
    private static wrapList;
    static locale(locale: string, localization: SpLang): typeof Spectrum;
    constructor(ele: HTMLInputElement, options?: Partial<Options>);
    get id(): number;
    get container(): HTMLElement;
    show(): this;
    hide(): this;
    toggle(): this;
    reflow(): this;
    option(optionName?: string | undefined, optionValue?: any): any;
    enable(): this;
    disable(): this;
    offset(coord: OffsetCSSOptions): this;
    set(color: ColorInput, ignoreFormatChange?: boolean): this;
    get(): ColorInput;
    destroy(): this;
    rebuild(options?: Partial<Options>): this;
    private destroyInnerObject;
    listeners(eventName: string): EventListener[];
    on(eventName: string, listener: SpListener, options?: AddEventListenerOptions | undefined): Function;
    once(eventName: string, listener: SpListener, options?: AddEventListenerOptions | undefined): Function;
    off(eventName?: string, listener?: EventListener | SpListener | undefined): void;
}
export {};
