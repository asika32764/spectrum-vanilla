import { Instance, ColorInput } from 'tinycolor2';

type OffsetCSSOptions = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    using?: Function;
};

/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */

type SpectrumEvent = CustomEvent<{
    color: Instance;
}>;
type SpectrumListener = (event: SpectrumEvent) => any;
interface SpectrumOptions {
    callbacks: {
        beforeShow: SpectrumListener;
        move: SpectrumListener;
        change: SpectrumListener;
        show: SpectrumListener;
        hide: SpectrumListener;
    };
    beforeShow?: SpectrumListener;
    move?: SpectrumListener;
    change?: SpectrumListener;
    show?: SpectrumListener;
    hide?: SpectrumListener;
    color: string;
    type: 'color' | 'text' | 'component' | 'flat';
    showInput: boolean;
    allowEmpty: boolean;
    showButtons: boolean;
    clickoutFiresChange: boolean;
    showInitial: boolean;
    showPalette: boolean;
    showPaletteOnly: boolean;
    hideAfterPaletteSelect: boolean;
    togglePaletteOnly: boolean;
    showSelectionPalette: boolean;
    localStorageKey: string;
    appendTo: string;
    maxSelectionSize: number;
    locale: string | SpectrumLang;
    cancelText: string;
    chooseText: string;
    togglePaletteMoreText: string;
    togglePaletteLessText: string;
    clearText: string;
    noColorSelectedText: string;
    preferredFormat: SpectrumColorFormat;
    containerClassName: string;
    replacerClassName: string;
    showAlpha: boolean;
    theme: string;
    palette: string[][];
    selectionPalette: string[];
    disabled: boolean;
    offset: OffsetCSSOptions | null;
}
type SpectrumColorFormat = "rgb" | "prgb" | "hex" | "hex6" | "hex3" | "hex4" | "hex8" | "name" | "hsl" | "hsv";
interface SpectrumLang {
    cancelText?: string;
    chooseText?: string;
    clearText?: string;
    togglePaletteMoreText?: string;
    togglePaletteLessText?: string;
    noColorSelectedText?: string;
}

/**
 * spectrum-vanilla.js
 *
 * @copyright  Copyright (C) 2023.
 * @license    MIT
 */

/**
 * Lightweight drag helper.  Handles containment within the element, so that
 * when dragging, the x is within [0,element.width] and y is within [0,element.height]
 */
declare function draggable(element: HTMLElement, onmove: (x: number, y: number, e: DragEvent) => void, onstart: (x: number, y: number, e: DragEvent) => void, onstop: (x: number, y: number, e: DragEvent) => void): void;
declare class Spectrum {
    private spectrum;
    ele: HTMLElement;
    options: Partial<SpectrumOptions>;
    eventListeners: {
        [event: string]: EventListener[];
    };
    static defaultOptions: Partial<SpectrumOptions>;
    static draggable: typeof draggable;
    static localization: {
        [locale: string]: SpectrumLang;
    };
    static palette: string[][];
    static create(selector: string | HTMLElement, options?: Partial<SpectrumOptions>): Spectrum;
    static createIfExists(selector: string | HTMLElement, options?: Partial<SpectrumOptions>): Spectrum | null;
    static getInstance(selector: string | HTMLElement, options?: Partial<SpectrumOptions>): Spectrum;
    static hasInstance(selector: string | HTMLElement): boolean;
    static createMultiple(selector: string | NodeListOf<HTMLElement>, options?: Partial<SpectrumOptions>): Spectrum[];
    static getInstanceMultiple(selector: string | JQuery | NodeListOf<HTMLElement>, options?: Partial<SpectrumOptions>): Spectrum[];
    private static wrap;
    private static wrapList;
    static locale(locale: string, localization: SpectrumLang): typeof Spectrum;
    static registerJQuery($: JQueryStatic): void;
    constructor(ele: HTMLElement, options?: Partial<SpectrumOptions>);
    get id(): number;
    get container(): HTMLElement;
    show(): this;
    hide(): this;
    toggle(): this;
    reflow(): this;
    option(): SpectrumOptions;
    option<T extends keyof SpectrumOptions>(optionName?: T): SpectrumOptions[T];
    option<T extends keyof SpectrumOptions>(optionName: T, optionValue: SpectrumOptions[T]): Spectrum;
    enable(): this;
    disable(): this;
    offset(coord: OffsetCSSOptions): this;
    set(color: ColorInput, ignoreFormatChange?: boolean): this;
    get(): ColorInput;
    destroy(): this;
    rebuild(options?: Partial<SpectrumOptions>): this;
    private destroyInnerObject;
    listeners(eventName: string): EventListener[];
    on(eventName: string, listener: SpectrumListener, options?: AddEventListenerOptions | undefined): Function;
    once(eventName: string, listener: SpectrumListener, options?: AddEventListenerOptions | undefined): Function;
    off(eventName?: string, listener?: EventListener | SpectrumListener | undefined): void;
}

export { Spectrum as default };
