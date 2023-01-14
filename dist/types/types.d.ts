import { OffsetCSSOptions } from './utils';
/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */
import { Instance as Tinycolor } from 'tinycolor2';
export type SpEvent = CustomEvent<{
    color: Tinycolor;
}>;
export type SpListener = (event: SpEvent) => any;
export interface Options {
    callbacks: {
        beforeShow: SpListener;
        move: SpListener;
        change: SpListener;
        show: SpListener;
        hide: SpListener;
    };
    beforeShow?: SpListener;
    move?: SpListener;
    change?: SpListener;
    show?: SpListener;
    hide?: SpListener;
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
    locale: string | SpLang;
    cancelText: string;
    chooseText: string;
    togglePaletteMoreText: string;
    togglePaletteLessText: string;
    clearText: string;
    noColorSelectedText: string;
    preferredFormat: ColorFormat;
    containerClassName: string;
    replacerClassName: string;
    showAlpha: boolean;
    theme: string;
    palette: string[][];
    selectionPalette: string[];
    disabled: boolean;
    offset: OffsetCSSOptions | null;
}
export type ColorFormat = "rgb" | "prgb" | "hex" | "hex6" | "hex3" | "hex4" | "hex8" | "name" | "hsl" | "hsv";
export interface SpLang {
    cancelText?: string;
    chooseText?: string;
    clearText?: string;
    togglePaletteMoreText?: string;
    togglePaletteLessText?: string;
    noColorSelectedText?: string;
}
