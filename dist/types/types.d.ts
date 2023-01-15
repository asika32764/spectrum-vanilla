/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */
import { OffsetCSSOptions } from './utils';
import { Instance as Tinycolor } from 'tinycolor2';
export type SpectrumEvent = CustomEvent<{
    color: Tinycolor;
}>;
export type SpectrumListener = (event: SpectrumEvent) => any;
export interface SpectrumOptions {
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
export type SpectrumColorFormat = "rgb" | "prgb" | "hex" | "hex6" | "hex3" | "hex4" | "hex8" | "name" | "hsl" | "hsv";
export interface SpectrumLang {
    cancelText?: string;
    chooseText?: string;
    clearText?: string;
    togglePaletteMoreText?: string;
    togglePaletteLessText?: string;
    noColorSelectedText?: string;
}
