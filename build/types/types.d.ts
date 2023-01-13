/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */
export interface Options {
    callbacks: {
        beforeShow: Function;
        move: Function;
        change: Function;
        show: Function;
        hide: Function;
    };
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
    locale: string;
    cancelText: string;
    chooseText: string;
    togglePaletteMoreText: string;
    togglePaletteLessText: string;
    clearText: string;
    noColorSelectedText: string;
    preferredFormat: "rgb" | "prgb" | "hex" | "hex6" | "hex3" | "hex4" | "hex8" | "name" | "hsl" | "hsv";
    containerClassName: string;
    replacerClassName: string;
    showAlpha: boolean;
    theme: string;
    palette: string[][];
    selectionPalette: string[];
    disabled: boolean;
    offset: number | null;
}
