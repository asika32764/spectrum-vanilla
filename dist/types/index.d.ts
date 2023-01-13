import { ColorInput } from 'tinycolor2';
import { Options } from './types';
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
    static defaultOptions: Partial<Options>;
    static draggable: typeof draggable;
    static create(selector: string | HTMLInputElement, options?: Partial<Options>): Spectrum;
    static getInstance(selector: string | HTMLInputElement, options?: Partial<Options>): any;
    static createMultiple(selector: string | NodeListOf<HTMLInputElement>, options?: Partial<Options>): Spectrum[];
    static getInstanceMultiple(selector: string | NodeListOf<HTMLInputElement>, options?: Partial<Options>): Spectrum[];
    private static wrap;
    private static wrapList;
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
    rebuild(): this;
}
export {};
