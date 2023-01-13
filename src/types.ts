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
  }

  // Options
  color: boolean;
  type: string;
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
  localStorageKey: boolean;
  appendTo: string;
  maxSelectionSize: number;
  locale: string;
  cancelText: string;
  chooseText: string;
  togglePaletteMoreText: string;
  togglePaletteLessText:string;
  clearText: string;
  noColorSelectedText: string;
  preferredFormat: string;
  containerClassName: string;
  replacerClassName: string;
  showAlpha: boolean;
  theme: string;
  palette: string[][];
  selectionPalette: string[];
  disabled: boolean;
  offset: number|null;
}
