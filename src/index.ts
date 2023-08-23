/**
 * spectrum-vanilla.js
 *
 * @copyright  Copyright (C) 2023.
 * @license    MIT
 */

import tinycolor, { ColorInput, Instance } from 'tinycolor2';
import { insertAfter, outerWidthWithMargin, wrap } from './dom';
import { SpectrumColorFormat, SpectrumOptions, SpectrumLang, SpectrumListener } from './types';
import {
  addClass,
  emit,
  eventDelegate,
  getElementOffset,
  html,
  OffsetCSSOptions,
  removeClass,
  setElementOffset,
  throttle,
  toggleClass,
} from './utils';

const defaultOpts: Partial<SpectrumOptions> = {

    // Callbacks
    beforeShow: noop,
    move: noop,
    change: noop,
    show: noop,
    hide: noop,

    // Options
    color: '',
    type: 'component', // text, color, component or flat
    showInput: false,
    allowEmpty: true,
    showButtons: true,
    clickoutFiresChange: true,
    showInitial: false,
    showPalette: true,
    showPaletteOnly: false,
    hideAfterPaletteSelect: false,
    togglePaletteOnly: false,
    showSelectionPalette: true,
    localStorageKey: '',
    appendTo: 'body',
    maxSelectionSize: 8,
    locale: 'en',
    cancelText: 'cancel',
    chooseText: 'choose',
    togglePaletteMoreText: 'more',
    togglePaletteLessText: 'less',
    clearText: 'Clear Color Selection',
    noColorSelectedText: 'No Color Selected',
    preferredFormat: 'name',
    containerClassName: '',
    replacerClassName: '',
    showAlpha: true,
    theme: 'sp-light',
    palette: [
      ['#000000', '#444444', '#5b5b5b', '#999999', '#bcbcbc', '#eeeeee', '#f3f6f4', '#ffffff'],
      ['#f44336', '#744700', '#ce7e00', '#8fce00', '#2986cc', '#16537e', '#6a329f', '#c90076'],
      ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
      ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
      ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
      ['#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
      ['#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
      ['#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'],
    ],
    selectionPalette: [] as string[],
    disabled: false,
    offset: null,
  },
  spectrums: any[] = [],
  replaceInput = html(
    [
      '<div class=\'sp-replacer\'>',
      '<div class=\'sp-preview\'><div class=\'sp-preview-inner\'></div></div>',
      '<div class=\'sp-dd\'>&#9660;</div>',
      '</div>',
    ].join(''),
  ) as HTMLElement,
  markup = (function () {
    return [
      '<div class=\'sp-container sp-hidden\'>',
      '<div class=\'sp-palette-container\'>',
      '<div class=\'sp-palette sp-thumb sp-cf\'></div>',
      '<div class=\'sp-palette-button-container sp-cf\'>',
      '<button type=\'button\' class=\'sp-palette-toggle\'></button>',
      '</div>',
      '</div>',
      '<div class=\'sp-picker-container\'>',
      '<div class=\'sp-top sp-cf\'>',
      '<div class=\'sp-fill\'></div>',
      '<div class=\'sp-top-inner\'>',
      '<div class=\'sp-color\'>',
      '<div class=\'sp-sat\'>',
      '<div class=\'sp-val\'>',
      '<div class=\'sp-dragger\'></div>',
      '</div>',
      '</div>',
      '</div>',
      '<div class=\'sp-clear sp-clear-display\'>',
      '</div>',
      '<div class=\'sp-hue\'>',
      '<div class=\'sp-slider\'></div>',
      '</div>',
      '</div>',
      '<div class=\'sp-alpha\'><div class=\'sp-alpha-inner\'><div class=\'sp-alpha-handle\'></div></div></div>',
      '</div>',
      '<div class=\'sp-input-container sp-cf\'>',
      '<input class=\'sp-input\' type=\'text\' spellcheck=\'false\'  />',
      '</div>',
      '<div class=\'sp-initial sp-thumb sp-cf\'></div>',
      '<div class=\'sp-button-container sp-cf\'>',
      '<button class=\'sp-cancel\' href=\'#\'></button>',
      '<button type=\'button\' class=\'sp-choose\'></button>',
      '</div>',
      '</div>',
      '</div>',
    ].join('');
  })();

function paletteTemplate(p: ColorInput[], color: ColorInput, className: string, opts: any) {
  const html = [];
  for (let i = 0; i < p.length; i++) {
    const current = p[i];
    if (current) {
      const tiny = tinycolor(current);
      let c = tiny.toHsl().l < 0.5 ? 'sp-thumb-el sp-thumb-dark' : 'sp-thumb-el sp-thumb-light';
      c += (tinycolor.equals(color, current)) ? ' sp-thumb-active' : '';
      const formattedString = tiny.toString(opts.preferredFormat || 'rgb');
      const swatchStyle = 'background-color:' + tiny.toRgbString();
      html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';"></span></span>');
    } else {
      html.push('<span class="sp-thumb-el sp-clear-display" ><span class="sp-clear-palette-only" style="background-color: transparent;"></span></span>');
    }
  }
  return '<div class=\'sp-cf ' + className + '\'>' + html.join('') + '</div>';
}

function hideAll() {
  for (let i = 0; i < spectrums.length; i++) {
    if (spectrums[i]) {
      spectrums[i].hide();
    }
  }
}

function instanceOptions(options: Partial<SpectrumOptions>, element: HTMLElement): SpectrumOptions {
  // Clone first
  options = Object.assign({}, options);

  options.locale = options.locale || window.navigator.language;

  if (typeof options.locale === 'string') {
    if (options.locale) {
      // handle locale like "zh-TW" to "zh-tw"
      // handle locale like "fr-FR" to "fr"
      let parts = options.locale.split('-')
        .map((p) => p.toLowerCase());

      if (parts[0] === parts[1]) {
        parts = [parts[0]];
      }

      options.locale = parts.join('-');
    }

    if (options.locale !== 'en' && Spectrum.localization[options.locale]) {
      options = Object.assign({}, options, Spectrum.localization[options.locale]);
    }
  } else {
    options = Object.assign({}, options, options.locale);
  }

  const opts = Object.assign({}, defaultOpts, element.dataset, options) as SpectrumOptions;

  opts.callbacks = {
    'move': bind(opts.move as Function, element),
    'change': bind(opts.change as Function, element),
    'show': bind(opts.show as Function, element),
    'hide': bind(opts.hide as Function, element),
    'beforeShow': bind(opts.beforeShow as Function, element),
  };

  return opts;
}

function spectrum(element: HTMLElement, options: Partial<SpectrumOptions>) {

  let opts = instanceOptions(options, element),
    type = opts.type,
    flat = (type === 'flat'),
    showSelectionPalette = opts.showSelectionPalette,
    localStorageKey = opts.localStorageKey,
    theme = opts.theme,
    callbacks = opts.callbacks,
    resize = throttle(reflow, 10),
    visible = false,
    isDragging = false,
    dragWidth = 0,
    dragHeight = 0,
    dragHelperHeight = 0,
    slideHeight = 0,
    slideWidth = 0,
    alphaWidth = 0,
    alphaSlideHelperWidth = 0,
    slideHelperHeight = 0,
    currentHue = 0,
    currentSaturation = 0,
    currentValue = 0,
    currentAlpha = 1,
    palette: any = [],
    paletteArray: any[] = [],
    paletteLookup: any = {},
    selectionPalette = opts.selectionPalette.slice(0),
    maxSelectionSize = opts.maxSelectionSize,
    draggingClass = 'sp-dragging',
    abortNextInputChange = false,
    shiftMovementDirection: any = null;

  const doc = element.ownerDocument;

  const container = html(markup, doc) as HTMLElement;
  container.classList.add(theme);
  doc.body.appendChild(container);

  let body = doc.body,
    boundElement: HTMLElement | HTMLInputElement = element,
    disabled = false,
    pickerContainer = container.querySelector('.sp-picker-container') as HTMLElement,
    dragger = container.querySelector('.sp-color') as HTMLElement,
    dragHelper = container.querySelector('.sp-dragger') as HTMLElement,
    slider = container.querySelector('.sp-hue') as HTMLElement,
    slideHelper = container.querySelector('.sp-slider') as HTMLElement,
    alphaSliderInner = container.querySelector('.sp-alpha-inner') as HTMLElement,
    alphaSlider = container.querySelector('.sp-alpha') as HTMLElement,
    alphaSlideHelper = container.querySelector('.sp-alpha-handle') as HTMLElement,
    textInput = container.querySelector('.sp-input') as HTMLInputElement,
    paletteContainer = container.querySelector('.sp-palette') as HTMLElement,
    initialColorContainer = container.querySelector('.sp-initial') as HTMLElement,
    cancelButton = container.querySelector('.sp-cancel') as HTMLElement,
    clearButton = container.querySelector('.sp-clear') as HTMLElement,
    chooseButton = container.querySelector('.sp-choose') as HTMLElement,
    toggleButton = container.querySelector('.sp-palette-toggle') as HTMLElement,
    isInput = boundElement.nodeName === 'INPUT',
    isInputTypeColor = isInput && boundElement.getAttribute('type') === 'color',
    shouldReplace = isInput && (type === 'color' || isInputTypeColor),
    replacer = (shouldReplace)
      ? (() => {
        addClass(replaceInput, theme);
        addClass(replaceInput, opts.replacerClassName);
        return replaceInput;
      })()
      : null,
    offsetElement = (shouldReplace) ? replacer : boundElement,
    previewElement = replacer?.querySelector('.sp-preview-inner') as HTMLElement,
    initialColor = opts.color || (isInput && (boundElement as HTMLInputElement).value),
    colorOnShow: ColorInput = '',
    currentPreferredFormat = opts.preferredFormat,
    clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
    isEmpty = !initialColor,
    allowEmpty = opts.allowEmpty;

  // Element to be updated with the input color. Populated in initialize method
  let originalInputContainer: HTMLSpanElement;
  let colorizeElement: HTMLElement | null;
  let colorizeElementInitialColor: string;
  let colorizeElementInitialBackground: string;

  //If there is a label for this element, when clicked on, show the colour picker
  const thisId = boundElement.getAttribute('id') || '';
  if (thisId !== undefined && thisId.length > 0) {
    const labels = document.querySelectorAll(`label[for="${thisId}"]`);

    labels.forEach((label) => {
      label.addEventListener('click', function (e) {
        e.preventDefault();
        show();
        return false;
      });
    });
  }

  function applyOptions() {

    if (opts.showPaletteOnly) {
      opts.showPalette = true;
    }

    if (toggleButton) {
      toggleButton.textContent = opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText;
    }

    if (opts.palette) {
      palette = opts.palette.slice(0);
      paletteArray = Array.isArray(palette[0]) ? palette : [palette];
      paletteLookup = {};
      for (let i = 0; i < paletteArray.length; i++) {
        for (let j = 0; j < paletteArray[i].length; j++) {
          const rgb = tinycolor(paletteArray[i][j]).toRgbString();
          paletteLookup[rgb] = true;
        }
      }

      // if showPaletteOnly and didn't set initialcolor
      // set initialcolor to first palette
      if (opts.showPaletteOnly && !initialColor) {
        initialColor = (palette[0][0] === '') ? palette[0][0] : Object.keys(paletteLookup)[0];
      }
    }

    toggleClass(container, 'sp-flat', flat);
    toggleClass(container, 'sp-input-disabled', !opts.showInput);
    toggleClass(container, 'sp-alpha-enabled', opts.showAlpha);
    toggleClass(container, 'sp-clear-enabled', allowEmpty);
    toggleClass(container, 'sp-buttons-disabled', !opts.showButtons);
    toggleClass(container, 'sp-palette-buttons-disabled', !opts.togglePaletteOnly);
    toggleClass(container, 'sp-palette-disabled', !opts.showPalette);
    toggleClass(container, 'sp-palette-only', opts.showPaletteOnly);
    toggleClass(container, 'sp-initial-disabled', !opts.showInitial);
    addClass(container, opts.containerClassName);

    reflow();
  }

  function offsetElementStart(e: Event) {
    if (!disabled) {
      show();
    }

    e.stopPropagation();
    const target = e.target as HTMLElement;

    if (!target.matches('input')) {
      e.preventDefault();
    }
  }

  function initialize() {
    applyOptions();
    const inputStyle = window.getComputedStyle(boundElement);

    originalInputContainer = html('<span class="sp-original-input-container"></span>') as HTMLSpanElement;
    ['margin'].forEach((cssProp: string)=> {
      const st = originalInputContainer.style;
      originalInputContainer.style.setProperty(cssProp, inputStyle.getPropertyValue(cssProp));
    });
    // inline-flex by default, switching to flex if needed

    if (inputStyle.display === 'block') {
      originalInputContainer.style.display = 'flex';
    }

    boundElement.style.display = '';

    if (shouldReplace) {
      insertAfter(boundElement, replacer as Element);
      boundElement.style.display = 'none';
    } else if (type === 'text') {
      addClass(originalInputContainer, 'sp-colorize-container');
      addClass(boundElement, 'spectrum sp-colorize');
      wrap(boundElement, originalInputContainer);
    } else if (type === 'component') {
      addClass(boundElement, 'spectrum');
      wrap(boundElement, originalInputContainer);
      const addOn = html(['<div class=\'sp-colorize-container sp-add-on\'>',
        '<div class=\'sp-colorize\'></div> ',
        '</div>'].join('')) as HTMLElement;

      addOn.style.width = boundElement.offsetHeight + 'px';
      addOn.style.borderRadius = inputStyle.borderRadius;
      addOn.style.border = inputStyle.border;

      boundElement.classList.add('with-add-on');

      boundElement.before(addOn);
    }

    colorizeElement = boundElement.parentNode?.querySelector('.sp-colorize');
    colorizeElementInitialColor = colorizeElement?.style.color || '';
    colorizeElementInitialBackground = colorizeElement?.style.backgroundColor || '';

    if (!allowEmpty) {
      clearButton.style.display = 'none';
    }

    if (flat) {
      boundElement.after(container);
      boundElement.style.display = 'none';
    } else {

      let appendTo = opts.appendTo === 'parent' ? boundElement.parentElement : opts.appendTo;
      if (!appendTo) {
        appendTo = document.body;
      }

      if (typeof appendTo !== 'string') {
        appendTo.append(container);
      }
    }

    updateSelectionPaletteFromStorage();

    offsetElement?.addEventListener('click', offsetElementStart);
    offsetElement?.addEventListener('touchstart', offsetElementStart);

    if (boundElement.matches(':disabled') || opts.disabled) {
      disable();
    }

    // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
    container.addEventListener('click', (e) => e.stopPropagation());

    // Handle user typed input
    [textInput, boundElement].forEach(function (input: HTMLElement | HTMLInputElement) {
      if (!('value' in input)) {
        return;
      }

      input.addEventListener('change', () => {
        setFromTextInput(input.value);
      });
      input.addEventListener('paste', () => {
        setTimeout(() => {
          setFromTextInput(input.value);
        }, 1);
      });
      input.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
          setFromTextInput(input.value);
          if (input === boundElement) {
            hide();
          }
        }
      });
    });

    cancelButton.textContent = opts.cancelText;
    cancelButton.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      revert();
      hide();
    });

    clearButton.setAttribute('title', opts.clearText);
    clearButton.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      isEmpty = true;
      move();

      if (flat) {
        //for the flat style, this is a change event
        updateOriginalInput(true);
      }
    });

    chooseButton.textContent = opts.chooseText;
    chooseButton.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();

      // if (IE && textInput.matches(':focus')) {
      //   textInput.dispatchEvent(new CustomEvent('change'));
      // }

      if (isValid()) {
        updateOriginalInput(true);
        hide();
      }
    });

    toggleButton.textContent = opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText;
    toggleButton.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();

      opts.showPaletteOnly = !opts.showPaletteOnly;

      // To make sure the Picker area is drawn on the right, next to the
      // Palette area (and not below the palette), first move the Palette
      // to the left to make space for the picker, plus 5px extra.
      // The 'applyOptions' function puts the whole container back into place
      // and takes care of the button-text and the sp-palette-only CSS class.
      if (!opts.showPaletteOnly && !flat) {
        container.style.left = '-=' + (outerWidthWithMargin(pickerContainer) + 5);
      }
      applyOptions();
    });

    draggable(alphaSlider, function (dragX, dragY, e) {
      currentAlpha = (dragX / alphaWidth);
      isEmpty = false;
      if (e.shiftKey) {
        currentAlpha = Math.round(currentAlpha * 10) / 10;
      }

      move();
    }, dragStart, dragStop);

    draggable(slider, function (dragX, dragY) {
      currentHue = dragY / slideHeight;
      isEmpty = false;
      if (!opts.showAlpha) {
        currentAlpha = 1;
      }
      move();
    }, dragStart, dragStop);

    draggable(dragger, function (dragX, dragY, e) {

      // shift+drag should snap the movement to either the x or y axis.
      if (!e.shiftKey) {
        shiftMovementDirection = null;
      } else if (!shiftMovementDirection) {
        const oldDragX = currentSaturation * dragWidth;
        const oldDragY = dragHeight - (currentValue * dragHeight);
        const furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

        shiftMovementDirection = furtherFromX ? 'x' : 'y';
      }

      const setSaturation = !shiftMovementDirection || shiftMovementDirection === 'x';
      const setValue = !shiftMovementDirection || shiftMovementDirection === 'y';

      if (setSaturation) {
        currentSaturation = (dragX / dragWidth);
      }
      if (setValue) {
        currentValue = ((dragHeight - dragY) / dragHeight);
      }

      isEmpty = false;
      if (!opts.showAlpha) {
        currentAlpha = 1;
      }

      move();

    }, dragStart, dragStop);

    if (!!initialColor) {
      set(initialColor);

      // In case color was black - update the preview UI and set the format
      // since the set function will not run (default color is black).
      updateUI();
      currentPreferredFormat = tinycolor(initialColor).getFormat() as SpectrumColorFormat || opts.preferredFormat;
      addColorToSelectionPalette(initialColor);
    } else if (initialColor === '') {
      set(initialColor);
      updateUI();
    } else {
      updateUI();
    }

    if (flat) {
      show();
    }

    function paletteElementClick(e: Event) {
      // @ts-ignore
      if (e.data && e.data.ignore) {
        const el = (e.target as HTMLElement).closest('.sp-thumb-el') as HTMLElement | null;
        set(el?.dataset?.color || '');
        move();
      } else {
        const el = (e.target as HTMLElement).closest('.sp-thumb-el') as HTMLElement | null;
        set(el?.dataset?.color || '');
        move();

        // If the picker is going to close immediately, a palette selection
        // is a change.  Otherwise, it's a move only.
        if (opts.hideAfterPaletteSelect) {
          updateOriginalInput(true);
          hide();
        } else {
          updateOriginalInput();
        }
      }

      return false;
    }

    const paletteEvents = ['click', 'touchstart'];

    for (const paletteEvent of paletteEvents) {
      eventDelegate(paletteContainer, paletteEvent, '.sp-thumb-el', paletteElementClick);
      eventDelegate(initialColorContainer, paletteEvent, '.sp-thumb-el:nth-child(1)', paletteElementClick, { ignore: true });
    }
  }

  function updateSelectionPaletteFromStorage() {
    if (localStorageKey) {
      // Migrate old palettes over to new format.  May want to remove this eventually.
      try {
        const localStorage = window.localStorage;
        const oldPalette = localStorage[localStorageKey].split(',#');
        if (oldPalette.length > 1) {
          delete localStorage[localStorageKey];

          for (const c of oldPalette) {
            addColorToSelectionPalette(c);
          }
        }
      } catch (e) {
      }

      try {
        selectionPalette = window.localStorage[localStorageKey].split(';');
      } catch (e) {
      }
    }
  }

  function addColorToSelectionPalette(color: ColorInput) {
    if (showSelectionPalette) {
      const rgb = tinycolor(color).toRgbString();

      if (!paletteLookup[rgb] && !selectionPalette.includes(rgb)) {
        selectionPalette.push(rgb);
        while (selectionPalette.length > maxSelectionSize) {
          selectionPalette.shift();
        }
      }

      if (localStorageKey) {
        try {
          window.localStorage[localStorageKey] = selectionPalette.join(';');
        } catch (e) {
        }
      }
    }
  }

  function getUniqueSelectionPalette() {
    var unique = [];
    if (opts.showPalette) {
      for (var i = 0; i < selectionPalette.length; i++) {
        var rgb = tinycolor(selectionPalette[i]).toRgbString();

        if (!paletteLookup[rgb]) {
          unique.push(selectionPalette[i]);
        }
      }
    }

    return unique.reverse().slice(0, opts.maxSelectionSize);
  }

  function drawPalette() {

    const currentColor = get();

    const html = paletteArray.map((palette, i) => {
      return paletteTemplate(palette, currentColor, 'sp-palette-row sp-palette-row-' + i, opts);
    });

    updateSelectionPaletteFromStorage();

    if (selectionPalette) {
      html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, 'sp-palette-row sp-palette-row-selection', opts));
    }

    paletteContainer.innerHTML = html.join('');
  }

  function drawInitial() {
    if (opts.showInitial) {
      const initial = colorOnShow;
      const current = get();
      initialColorContainer.innerHTML = paletteTemplate([initial, current], current, 'sp-palette-row-initial', opts);
    }
  }

  function dragStart() {
    if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
      reflow();
    }
    isDragging = true;
    addClass(container, draggingClass);
    shiftMovementDirection = null;

    emit(boundElement, 'dragstart', { color: get() });
  }

  function dragStop() {
    isDragging = false;
    removeClass(container, draggingClass);
    emit(boundElement, 'dragstop', { color: get() });
  }

  function setFromTextInput(value: string) {
    if (abortNextInputChange) {
      abortNextInputChange = false;
      return;
    }
    if ((value === null || value === '') && allowEmpty) {
      set('');
      move();
      updateOriginalInput();
    } else {
      const tiny = tinycolor(value);
      if (tiny.isValid()) {
        set(tiny);
        move();
        updateOriginalInput();
      } else {
        textInput.classList.add('sp-validation-error');
      }
    }
  }

  function toggle() {
    if (visible) {
      hide();
    } else {
      show();
    }
  }

  function show() {
    if (visible) {
      reflow();
      return;
    }

    const event = emit(boundElement, 'beforeShow', { color: get() });

    if (callbacks.beforeShow(event) === false || event.defaultPrevented) {
      return;
    }

    hideAll();
    visible = true;

    doc.addEventListener('keydown', onkeydown);
    doc.addEventListener('click', clickout);
    window.addEventListener('resize', resize);
    replacer?.classList.add('sp-active');
    container.classList.remove('sp-hidden');

    reflow();
    updateUI();

    colorOnShow = get();

    drawInitial();

    const e = emit(boundElement, 'show', { color: colorOnShow });
    callbacks.show(e);
  }

  function onkeydown(e: KeyboardEvent) {
    // Close on ESC
    if (e.keyCode === 27) {
      hide();
    }
  }

  function clickout(e: MouseEvent) {
    // Return on right click.
    if (e.button == 2) {
      return;
    }

    // If a drag event was happening during the mouseup, don't hide
    // on click.
    if (isDragging) {
      return;
    }

    if (clickoutFiresChange) {
      updateOriginalInput(true);
    } else {
      revert();
    }
    hide();
  }

  function hide() {
    // Return if hiding is unnecessary
    if (!visible || flat) {
      return;
    }
    visible = false;

    doc.removeEventListener('keydown', onkeydown);
    doc.removeEventListener('click', clickout);
    window.removeEventListener('resize', resize);

    replacer?.classList.remove('sp-active');
    container.classList.add('sp-hidden');

    const event = emit(boundElement, 'hide', { color: get() });
    callbacks.hide(event);
  }

  function revert() {
    set(colorOnShow, true);
    updateOriginalInput(true);
  }

  function set(color: ColorInput, ignoreFormatChange: boolean = false) {
    if (tinycolor.equals(color, get())) {
      // Update UI just in case a validation error needs
      // to be cleared.
      updateUI();
      return;
    }

    var newColor, newHsv;
    if ((!color || color === undefined) && allowEmpty) {
      isEmpty = true;
    } else {
      isEmpty = false;
      newColor = tinycolor(color);
      newHsv = newColor.toHsv();

      currentHue = (newHsv.h % 360) / 360;
      currentSaturation = newHsv.s;
      currentValue = newHsv.v;
      currentAlpha = newHsv.a;
    }
    updateUI();

    if (newColor && newColor.isValid() && !ignoreFormatChange) {
      currentPreferredFormat = opts.preferredFormat || newColor.getFormat() as SpectrumColorFormat;
    }
  }

  function get(opts: any = {}): Instance | '' {
    if (allowEmpty && isEmpty) {
      return '';
    }

    return tinycolor.fromRatio({
      h: currentHue,
      s: currentSaturation,
      v: currentValue,
      a: Math.round(currentAlpha * 1000) / 1000,
      // @ts-ignore
    }, { format: opts.format || currentPreferredFormat });
  }

  function isValid() {
    return !textInput.classList.contains('sp-validation-error');
  }

  function move() {
    updateUI();

    const event = emit(boundElement, 'move', { color: get() });
    callbacks.move(event);
  }

  function updateUI() {

    textInput.classList.remove('sp-validation-error');

    updateHelperLocations();

    // Update dragger background color (gradients take care of saturation and value).
    const flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
    dragger.style.backgroundColor = flatColor.toHexString();

    // Get a format that alpha will be included in (hex and names ignore alpha)
    let format = currentPreferredFormat;
    if (currentAlpha < 1 && !(currentAlpha === 0 && format === 'name')) {
      if (format === 'hex' || format === 'hex3' || format === 'hex6' || format === 'name') {
        format = 'rgb';
      }
    }

    let realColor = get({ format }),
      displayColor = '';

    //reset background info for preview element
    if (previewElement) {
      previewElement.classList.remove('sp-clear-display');
      previewElement.style.backgroundColor = 'transparent';
    }

    if (realColor === '') {
      // Update the replaced elements background with icon indicating no color selection
      previewElement?.classList.add('sp-clear-display');
    } else {
      const realHex = realColor.toHexString();
      const realRgb = realColor.toRgbString();

      if (previewElement) {
        // Update the replaced elements background color (with actual selected color)
        if (realColor.getAlpha() === 1) {
          previewElement.style.backgroundColor = realRgb;
        } else {
          previewElement.style.backgroundColor = 'transparent';
          previewElement.style.filter = realColor.toFilter();
        }
      }

      if (opts.showAlpha) {
        const rgb = realColor.toRgb();
        rgb.a = 0;
        const realAlpha = tinycolor(rgb).toRgbString();

        alphaSliderInner.style.background = `linear-gradient(to right, ${realAlpha}, ${realHex})`;
      }

      displayColor = realColor.toString(format);
    }

    // Update the text entry input as it changes happen
    if (opts.showInput) {
      textInput.value = displayColor;
    }
    (boundElement as HTMLInputElement).value = displayColor;
    if (opts.type == 'text' || opts.type == 'component') {
      const color = realColor;
      if (color && colorizeElement) {
        const textColor = (color.isLight() || color.getAlpha() < 0.4) ? 'black' : 'white';
        colorizeElement.style.backgroundColor = color.toRgbString();
        colorizeElement.style.color = textColor;
      } else if (colorizeElement) {
        colorizeElement.style.backgroundColor = colorizeElementInitialBackground;
        colorizeElement.style.color = colorizeElementInitialColor;
      }
    }

    if (opts.showPalette) {
      drawPalette();
    }

    drawInitial();
  }

  function updateHelperLocations() {
    if (allowEmpty && isEmpty) {
      //if selected color is empty, hide the helpers
      alphaSlideHelper.style.display = 'none';
      slideHelper.style.display = 'none';
      dragHelper.style.display = 'none';
    } else {
      //make sure helpers are visible
      alphaSlideHelper.style.display = 'block';
      slideHelper.style.display = 'block';
      dragHelper.style.display = 'block';

      // Where to show the little circle in that displays your current selected color
      let dragX = currentSaturation * dragWidth;
      let dragY = dragHeight - (currentValue * dragHeight);
      dragX = Math.max(
        -dragHelperHeight,
        Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight),
      );
      dragY = Math.max(
        -dragHelperHeight,
        Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight),
      );
      dragHelper.style.top = dragY + 'px';
      dragHelper.style.left = dragX + 'px';

      const alphaX = currentAlpha * alphaWidth;
      alphaSlideHelper.style.left = (alphaX - (alphaSlideHelperWidth / 2)) + 'px';

      // Where to show the bar that displays your current selected hue
      const slideY = (currentHue) * slideHeight;
      slideHelper.style.top = (slideY - slideHelperHeight) + 'px';
    }
  }

  function updateOriginalInput(fireCallback = false) {
    let color = get(),
      displayColor = '',
      hasChanged = !tinycolor.equals(color, colorOnShow);

    if (color) {
      displayColor = color.toString(currentPreferredFormat);
      // Update the selection palette with the current color
      addColorToSelectionPalette(color);
    }

    if (fireCallback && hasChanged) {
      // we trigger the change event or input, but the input change event is also binded
      // to some spectrum processing, that we do no need
      abortNextInputChange = true;
      const event = emit(boundElement, 'change', { color });
      callbacks.change(event);
    }
  }

  function reflow() {
    if (!visible) {
      return; // Calculations would be useless and wouldn't be reliable anyways
    }

    dragWidth = dragger.getBoundingClientRect().width;
    dragHeight = dragger.getBoundingClientRect().height;

    dragHelperHeight = dragHelper.getBoundingClientRect().height;
    slideWidth = slider.getBoundingClientRect().width;
    slideHeight = slider.getBoundingClientRect().height;
    slideHelperHeight = slideHelper.getBoundingClientRect().height;
    alphaWidth = alphaSlider.getBoundingClientRect().width;
    alphaSlideHelperWidth = alphaSlideHelper.getBoundingClientRect().width;

    if (!flat) {
      container.style.position = 'absolute';

      if (opts.offset) {
        setElementOffset(container, opts.offset);
      } else {
        setElementOffset(container, getOffset(container, offsetElement as HTMLElement));
      }
    }

    updateHelperLocations();

    if (opts.showPalette) {
      drawPalette();
    }

    emit(boundElement, 'reflow');
  }

  function destroy() {
    boundElement.style.display = '';
    boundElement.classList.remove('spectrum', 'with-add-on', 'sp-colorize');
    offsetElement.removeEventListener('click', offsetElementStart);
    offsetElement.removeEventListener('touchstart', offsetElementStart);

    container.remove();
    replacer?.remove();
    if (colorizeElement) {
      colorizeElement.style.backgroundColor = colorizeElementInitialBackground;
      colorizeElement.style.color = colorizeElementInitialColor;
    }
    const originalInputContainer = boundElement.closest('.sp-original-input-container');
    if (originalInputContainer) {
      originalInputContainer.after(boundElement);
      originalInputContainer.remove();
    }
    spectrums[spect.id] = null;
  }

  function option<T extends keyof SpectrumOptions>(
    optionName: T | undefined = undefined,
    optionValue: SpectrumOptions[T] = undefined
  ) {
    if (optionName === undefined) {
      return Object.assign({}, opts);
    }
    if (optionValue === undefined) {
      return opts[optionName];
    }

    opts[optionName] = optionValue;

    if (optionName === 'preferredFormat') {
      currentPreferredFormat = opts.preferredFormat;
    }
    applyOptions();
  }

  function enable() {
    disabled = false;
    (boundElement as HTMLInputElement).disabled = false;
    offsetElement.classList.remove('sp-disabled');
  }

  function disable() {
    hide();
    disabled = true;
    (boundElement as HTMLInputElement).disabled = true;
    offsetElement.classList.add('sp-disabled');
  }

  function setOffset(coord: OffsetCSSOptions) {
    opts.offset = coord;
    reflow();
  }

  initialize();

  let spect = {
    id: 0,
    show: show,
    hide: hide,
    toggle: toggle,
    reflow: reflow,
    option: option,
    enable: enable,
    disable: disable,
    offset: setOffset,
    set: function (c: ColorInput) {
      set(c);
      updateOriginalInput();
    },
    get: get,
    destroy: destroy,
    container: container,
  };

  spect.id = spectrums.push(spect) - 1;

  return spect;
}

/**
 * checkOffset - get the offset below/above and left/right element depending on screen position
 * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
 */
function getOffset(picker: HTMLElement, input: HTMLElement) {
  const extraY = 0;
  const dpWidth = picker.offsetWidth;
  const dpHeight = picker.offsetHeight;
  const inputHeight = input.offsetHeight;
  const doc = picker.ownerDocument;
  const docElem = doc.documentElement;
  const viewWidth = docElem.clientWidth + window.pageXOffset;
  const viewHeight = docElem.clientHeight + window.pageYOffset;
  const offset = getElementOffset(input);
  let offsetLeft = offset.left;
  let offsetTop = offset.top;

  offsetTop += inputHeight;

  offsetLeft -=
    Math.min(offsetLeft, (offsetLeft + dpWidth > viewWidth && viewWidth > dpWidth) ?
      Math.abs(offsetLeft + dpWidth - viewWidth) : 0);

  offsetTop -=
    Math.min(offsetTop, ((offsetTop + dpHeight > viewHeight && viewHeight > dpHeight) ?
      Math.abs(dpHeight + inputHeight - extraY) : extraY));

  return {
    top: offsetTop,
    // bottom: offset.bottom,
    left: offsetLeft,
    // right: offset.right,
    // width: offset.width,
    // height: offset.height
  };
}

/**
 * noop - do nothing
 */
function noop() {

}

/**
 * Create a function bound to a given object
 * Thanks to underscore.js
 */
function bind(func: Function, obj: object) {
  const slice = Array.prototype.slice;
  const args = slice.call(arguments, 2);
  return function () {
    return func.apply(obj, args.concat(slice.call(arguments)));
  };
}

/**
 * Lightweight drag helper.  Handles containment within the element, so that
 * when dragging, the x is within [0,element.width] and y is within [0,element.height]
 */
function draggable(
  element: HTMLElement,
  onmove: (x: number, y: number, e: DragEvent) => void,
  onstart: (x: number, y: number, e: DragEvent) => void,
  onstop: (x: number, y: number, e: DragEvent) => void,
) {
  onmove = onmove || noop;
  onstart = onstart || noop;
  onstop = onstop || noop;
  const doc = document;
  let dragging = false;
  let offset: OffsetCSSOptions = {};
  let maxHeight = 0;
  let maxWidth = 0;
  const hasTouch = ('ontouchstart' in window);

  const duringDragEvents: { [P in keyof HTMLElementEventMap]?: EventListenerOrEventListenerObject; } = {};
  duringDragEvents['selectstart'] = prevent;
  duringDragEvents['dragstart'] = prevent;
  duringDragEvents['touchmove'] = move;
  duringDragEvents['mousemove'] = move;
  duringDragEvents['touchend'] = stop;
  duringDragEvents['mouseup'] = stop;

  function prevent(e: Event) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.returnValue = false;
  }

  function move(e: TouchEvent | MouseEvent) {
    if (dragging) {
      const t0 = 'touches' in e && e.touches[0];
      const pageX = t0 && t0.pageX || (e as MouseEvent).pageX;
      const pageY = t0 && t0.pageY || (e as MouseEvent).pageY;

      const dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
      const dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

      if (hasTouch) {
        // Stop scrolling in iOS
        prevent(e);
      }

      onmove.apply(element, [dragX, dragY, e]);
    }
  }

  function start(e: TouchEvent | MouseEvent) {
    const rightclick = (e.which) ? (e.which == 3) : ((e as MouseEvent).button === 2);

    if (!rightclick && !dragging) {
      if (onstart.apply(element, arguments) !== false) {
        dragging = true;
        maxHeight = element.getBoundingClientRect().height;
        maxWidth = element.getBoundingClientRect().width;
        offset = getElementOffset(element);

        for (const eventName in duringDragEvents) {
          doc.addEventListener(eventName, duringDragEvents[eventName as keyof typeof duringDragEvents]);
        }

        doc.body.classList.add('sp-dragging');

        move(e);

        prevent(e);
      }
    }
  }

  function stop() {
    if (dragging) {
      for (const eventName in duringDragEvents) {
        doc.removeEventListener(eventName, duringDragEvents[eventName as keyof typeof duringDragEvents]);
      }
      doc.body.classList.remove('sp-dragging');

      // Wait a tick before notifying observers to allow the click event
      // to fire in Chrome.
      setTimeout(function () {
        onstop.apply(element, arguments);
      }, 0);
    }
    dragging = false;
  }

  element.addEventListener('touchstart', start);
  element.addEventListener('mousedown', start);
}

export default class Spectrum {
  private spectrum: any;
  public ele: HTMLElement;
  public options: Partial<SpectrumOptions>;
  public eventListeners: { [event: string]: EventListener[] } = {};

  static defaultOptions = defaultOpts;
  static draggable = draggable;
  static localization: { [locale: string]: SpectrumLang } = {};
  static palette: string[][] = [];

  static create(selector: string | HTMLElement, options: Partial<SpectrumOptions> = {}): Spectrum {
    const ele = this.wrap(selector);

    if (!ele) {
      let msg = 'Unable to find element';

      if (typeof selector === 'string') {
        msg += ' - Selector: ' + selector;
      }
      throw Error(msg);
    }

    return new this(ele, options);
  }

  static createIfExists(selector: string | HTMLElement, options: Partial<SpectrumOptions> = {}): Spectrum|null {
    const ele = this.wrap(selector);

    if (!ele) {
      return null;
    }

    return new this(ele, options);
  }

  static getInstance(selector: string | HTMLElement, options: Partial<SpectrumOptions> = {}): Spectrum {
    const ele = this.wrap(selector);

    // @ts-ignore
    return ele.__spectrum = ele.__spectrum || this.createIfExists(ele, options);
  }

  static hasInstance(selector: string | HTMLElement) {
    const ele = this.wrap(selector);

    // @ts-ignore
    return ele.__spectrum !== undefined;
  }

  static createMultiple(
    selector: string | NodeListOf<HTMLElement>,
    options: Partial<SpectrumOptions> = {}
  ) {
    const instances: Spectrum[] = [];

    this.wrapList(selector).forEach((ele) => {
      instances.push(this.create(ele, options));
    });

    return instances;
  }

  static getInstanceMultiple(
    selector: string | JQuery | NodeListOf<HTMLElement>,
    options: Partial<SpectrumOptions> = {},
  ) {
    const instances: Spectrum[] = [];

    this.wrapList(selector).forEach((ele) => {
      instances.push(this.getInstance(ele, options));
    });

    return instances;
  }

  private static wrap(selector: string | JQuery | HTMLElement): HTMLElement|null {
    if (typeof selector === 'string') {
      return document.querySelector<HTMLElement>(selector);
    } else if ((selector as JQuery).jquery) {
      return (selector as JQuery)[0];
    } else {
      return selector as HTMLElement;
    }
  }

  private static wrapList(selector: string | JQuery | NodeListOf<HTMLElement>): Array<HTMLElement> {
    if (typeof selector === 'string') {
      return Array.from(document.querySelectorAll<HTMLElement>(selector));
    } else if ((selector as JQuery).jquery) {
      return (selector as JQuery).toArray();
    } else {
      return Array.from(selector);
    }
  }

  static locale(locale: string, localization: SpectrumLang) {
    this.localization[locale] = localization;
    return this;
  }

  static registerJQuery($: JQueryStatic) {
    registerJQueryPlugin($);
  }

  constructor(ele: HTMLElement, options: Partial<SpectrumOptions> = {}) {
    this.spectrum = spectrum(ele, options);
    this.ele = ele;
    this.options = options;
  }

  get id(): number {
    return this.spectrum.id;
  }

  get container(): HTMLElement {
    // @ts-ignore
    if (!this.ele.__spectrum) {
      return this.ele;
    }

    return this.spectrum.container;
  }

  show() {
    this.spectrum.show();
    return this;
  }

  hide() {
    this.spectrum.hide();
    return this;
  }

  toggle() {
    this.spectrum.toggle();
    return this;
  }

  reflow() {
    this.spectrum.reflow();
    return this;
  }

  option(): SpectrumOptions;
  option<T extends keyof SpectrumOptions>(optionName?: T): SpectrumOptions[T];
  option<T extends keyof SpectrumOptions>(optionName: T, optionValue: SpectrumOptions[T]): Spectrum
  option<T extends keyof SpectrumOptions>(optionName?: T, optionValue?: SpectrumOptions[T]): any {
    return this.spectrum.option(optionName, optionValue);
  }

  enable() {
    this.spectrum.enable();
    return this;
  }

  disable() {
    this.spectrum.disable();
    return this;
  }

  offset(coord: OffsetCSSOptions) {
    this.spectrum.offset(coord);
    return this;
  }

  set(color: ColorInput, ignoreFormatChange: boolean = false) {
    this.spectrum.set(color, ignoreFormatChange);
    return this;
  }

  get(): ColorInput {
    return this.spectrum.get();
  }

  destroy() {
    this.destroyInnerObject();
    // @ts-ignore
    delete this.ele.__spectrum;
    return this;
  }

  rebuild(options?: Partial<SpectrumOptions>) {
    this.destroyInnerObject();
    if (options) {
      this.options = Object.assign({}, this.options, options);
    }
    this.spectrum = spectrum(this.ele, this.options);
    return this;
  }

  private destroyInnerObject() {
    this.spectrum.destroy();
    this.off();
  }

  listeners(eventName: string) {
    return this.eventListeners[eventName] || [];
  }

  on(
    eventName: string,
    listener: SpectrumListener,
    options: AddEventListenerOptions|undefined = undefined
  ): Function {
    this.ele.addEventListener(eventName, listener, options);

    this.eventListeners[eventName] = this.eventListeners[eventName] || [];

    this.eventListeners[eventName].push(listener);

    return () => {
      this.off(eventName, listener);
    };
  }

  once(
    eventName: string,
    listener: SpectrumListener,
    options: AddEventListenerOptions|undefined = undefined
  ): Function {
    const cancel = this.on(
      eventName,
      (e) => {
        listener(e);

        cancel();
      },
      options
    );

    return cancel;
  }

  off(eventName: string = undefined, listener: EventListener|SpectrumListener|undefined = undefined) {
    if (eventName && !this.eventListeners[eventName]) {
      return;
    }

    if (!eventName) {
      this.eventListeners = {};
      return;
    }

    if (listener) {
      this.eventListeners[eventName] = this.eventListeners[eventName]
        .filter((l) => l === listener);

      this.ele.removeEventListener(eventName, listener);
    } else {
      for (const listener of this.eventListeners[eventName]) {
        this.ele.removeEventListener(eventName, listener);
      }

      this.eventListeners[eventName] = [];
    }
  }
}

// @ts-ignore
const jQuery = window.jQuery;

if (jQuery) {
  registerJQueryPlugin(jQuery);
}

function registerJQueryPlugin($: any) {
  // @ts-ignore
  $.fn.spectrum = function (action: string | undefined | Partial<SpectrumOptions> = undefined, ...args) {
    if (typeof action === "string") {
      let returnValue = this;
      this.each(function () {
        const spect = this.__spectrum;

        if (spect) {
          const method = spect[action];

          if (!method) {
            throw new Error("Spectrum: no such method: '" + action + "'");
          }

          if (action === "get") {
            returnValue = spect.get();
          } else if (action === "container") {
            returnValue = $(spect.container);
          } else if (action === "option") {
            returnValue = spect.option.apply(spect, args);
          } else if (action === "destroy") {
            spect.destroy();
          } else {
            spect[action](...args);
          }
        }
      });

      return returnValue;
    }

    // Initializing a new instance of spectrum
    return this.each(function () {
      const options: SpectrumOptions = $.extend({}, $(this).data(), action);
      // Infer default type from input params and deprecated options
      if (!$(this).is('input')) {
        options.type = 'color';
      } else if (options.type == "flat") {
        options.type = 'flat';
      } else if ($(this).attr('type') == 'color') {
        options.type = 'color';
      } else {
        options.type = options.type || 'component';
      }

      if (Spectrum.hasInstance(this)) {
        const sp = Spectrum.getInstance(this);

        sp.options = options;
        sp.rebuild();
      } else {
        Spectrum.getInstance(this, options);
      }
    });
  };

  $.fn.spectrum.load = true;
  $.fn.spectrum.loadOpts = {};
  $.fn.spectrum.draggable = draggable;
  $.fn.spectrum.defaults = defaultOpts;
  $.fn.spectrum.localization = Spectrum.localization;
  $.fn.spectrum.palette = [];

  $.fn.spectrum.processNativeColorInputs = function () {
    const colorInputs = $("input[type=color]");
    if (colorInputs.length) {
      colorInputs.spectrum({
        preferredFormat: "hex6"
      });
    }
  };
}
