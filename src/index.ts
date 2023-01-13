import { Options } from './types';
import { addClass, html, throttle, toggleClass } from './utils';
import tinycolor from 'tinycolor2';

const localization: any = {};

const defaultOpts = {

    // Callbacks
    beforeShow: noop,
    move: noop,
    change: noop,
    show: noop,
    hide: noop,

    // Options
    color: false,
    type: '', // text, color, component or flat
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
    localStorageKey: false,
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
      [ '#000000', '#444444', '#5b5b5b', '#999999', '#bcbcbc', '#eeeeee', '#f3f6f4', '#ffffff' ],
      [ '#f44336', '#744700', '#ce7e00', '#8fce00', '#2986cc', '#16537e', '#6a329f', '#c90076' ],
      [ '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc' ],
      [ '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd' ],
      [ '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0' ],
      [ '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79' ],
      [ '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47' ],
      [ '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130' ]
    ],
    selectionPalette: [],
    disabled: false,
    offset: null
  },
  spectrums: HTMLElement[] = [],
  IE = !!/msie/i.exec(window.navigator.userAgent),
  rgbaSupport = (() => {
    function contains(str: string, substr: string) {
      return !!~('' + str).indexOf(substr);
    }

    const elem = document.createElement('div');
    const style = elem.style;
    style.cssText = 'background-color:rgba(0,0,0,.5)';
    return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
  })(),
  replaceInput = html(
    [
      '<div class=\'sp-replacer\'>',
      '<div class=\'sp-preview\'><div class=\'sp-preview-inner\'></div></div>',
      '<div class=\'sp-dd\'>&#9660;</div>',
      '</div>'
    ].join('')
  ),
  markup = (function () {

    // IE does not support gradients with multiple stops, so we need to simulate
    //  that for the rainbow slider with 8 divs that each have a single gradient
    let gradientFix = '';
    if (IE) {
      for (let i = 1; i <= 6; i++) {
        gradientFix += '<div class=\'sp-' + i + '\'></div>';
      }
    }

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
      gradientFix,
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
      '</div>'
    ].join('');
  })();

function paletteTemplate(p: string[], color: string, className: string, opts: any) {
  const html = [];
  for (let i = 0; i < p.length; i++) {
    const current = p[i];
    if (current) {
      const tiny = tinycolor(current);
      let c = tiny.toHsl().l < 0.5 ? 'sp-thumb-el sp-thumb-dark' : 'sp-thumb-el sp-thumb-light';
      c += (tinycolor.equals(color, current)) ? ' sp-thumb-active' : '';
      const formattedString = tiny.toString(opts.preferredFormat || 'rgb');
      const swatchStyle = rgbaSupport ? ('background-color:' + tiny.toRgbString()) : 'filter:' + tiny.toFilter();
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
      spectrums[i].style.display = 'none';
    }
  }
}

function instanceOptions(options: Options, callbackContext: object): Options {
  options.locale = options.locale || window.navigator.language;
  if (options.locale) options.locale = options.locale.split('-')[0].toLowerCase(); // handle locale like "fr-FR"
  if (options.locale !== 'en' && localization[options.locale]) {
    options = Object.assign({}, localization[options.locale], options);
  }
  const opts = Object.assign({}, defaultOpts, options);

  opts.callbacks = {
    'move': bind(opts.move as Function, callbackContext),
    'change': bind(opts.change as Function, callbackContext),
    'show': bind(opts.show as Function, callbackContext),
    'hide': bind(opts.hide as Function, callbackContext),
    'beforeShow': bind(opts.beforeShow as Function, callbackContext)
  };

  return opts;
}

function spectrum(element: HTMLInputElement, options: any) {

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
    paletteArray: any = [],
    paletteLookup: any = {},
    selectionPalette = opts.selectionPalette.slice(0),
    maxSelectionSize = opts.maxSelectionSize,
    draggingClass = 'sp-dragging',
    abortNextInputChange = false,
    shiftMovementDirection: any = null;

  const container = html(markup) as HTMLElement;
  container.classList.add(theme);

  let doc = element.ownerDocument,
    body = doc.body,
    boundElement: HTMLInputElement = element,
    disabled = false,
    pickerContainer = container.querySelector('.sp-picker-container'),
    dragger = container.querySelector('.sp-color'),
    dragHelper = container.querySelector('.sp-dragger'),
    slider = container.querySelector('.sp-hue'),
    slideHelper = container.querySelector('.sp-slider'),
    alphaSliderInner = container.querySelector('.sp-alpha-inner'),
    alphaSlider = container.querySelector('.sp-alpha'),
    alphaSlideHelper = container.querySelector('.sp-alpha-handle'),
    textInput = container.querySelector('.sp-input'),
    paletteContainer = container.querySelector('.sp-palette'),
    initialColorContainer = container.querySelector('.sp-initial'),
    cancelButton = container.querySelector('.sp-cancel'),
    clearButton = container.querySelector('.sp-clear'),
    chooseButton = container.querySelector('.sp-choose'),
    toggleButton = container.querySelector('.sp-palette-toggle'),
    isInput = boundElement.nodeName === 'INPUT',
    isInputTypeColor = isInput && boundElement.getAttribute('type') === 'color' && inputTypeColorSupport(),
    shouldReplace = isInput && type === 'color',
    replacer = (shouldReplace)
      ? (() => {
          replaceInput.classList.add(theme, opts.replacerClassName);
          return replaceInput;
        })()
      : null,
    offsetElement = (shouldReplace) ? replacer : boundElement,
    previewElement = replacer?.querySelector('.sp-preview-inner'),
    initialColor = opts.color || (isInput && boundElement.value),
    colorOnShow = false,
    currentPreferredFormat = opts.preferredFormat,
    clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
    isEmpty = !initialColor,
    allowEmpty = opts.allowEmpty;

  // Element to be updated with the input color. Populated in initialize method
  let originalInputContainer: HTMLElement | null = null,
    colorizeElement: HTMLElement | null = null,
    colorizeElementInitialColor: HTMLElement | null = null,
    colorizeElementInitialBackground: HTMLElement | null = null;

  //If there is a label for this element, when clicked on, show the colour picker
  const thisId = boundElement.getAttribute('id') || '';
  if (thisId !== undefined && thisId.length > 0) {
    const labels = document.querySelectorAll(`label[for="${thisId}"]`);

    labels.forEach((label) => {
      label.addEventListener('click', function (e) {
        e.preventDefault();
        // Todo: use native
        boundElement.spectrum('show');
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
      paletteArray = Array.isArray(palette[0]) ? palette : [ palette ];
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

  function initialize() {

    if (IE) {
      container.querySelector('*:not(input)')?.setAttribute('unselectable', 'on');
    }

    applyOptions();

    originalInputContainer = html('<span class="sp-original-input-container"></span>');
    [ 'margin' ].forEach(function (cssProp) {
      originalInputContainer.style[cssProp] = boundElement.style[cssProp];
    });
    // inline-flex by default, switching to flex if needed
    if (boundElement.style.display === 'block') {
      originalInputContainer.style.display = 'flex';
    }

    if (shouldReplace) {
      boundElement.after(replacer).hide();
    } else if (type === 'text') {
      originalInputContainer.addClass('sp-colorize-container');
      boundElement.addClass('spectrum sp-colorize').wrap(originalInputContainer);
    } else if (type === 'component') {
      boundElement.addClass('spectrum').wrap(originalInputContainer);
      var addOn = $([ '<div class=\'sp-colorize-container sp-add-on\'>',
        '<div class=\'sp-colorize\'></div> ',
        '</div>' ].join(''));
      addOn.width(boundElement.outerHeight() + 'px')
        .css('border-radius', boundElement.css('border-radius'))
        .css('border', boundElement.css('border'));
      boundElement.addClass('with-add-on').before(addOn);
    }

    colorizeElement = boundElement.parent().find('.sp-colorize');
    colorizeElementInitialColor = colorizeElement.css('color');
    colorizeElementInitialBackground = colorizeElement.css('background-color');

    if (!allowEmpty) {
      clearButton.hide();
    }

    if (flat) {
      boundElement.after(container).hide();
    } else {

      var appendTo = opts.appendTo === 'parent' ? boundElement.parent() : $(opts.appendTo);
      if (appendTo.length !== 1) {
        appendTo = $('body');
      }

      appendTo.append(container);
    }

    updateSelectionPaletteFromStorage();

    offsetElement.on('click.spectrum touchstart.spectrum', function (e) {
      if (!disabled) {
        show();
      }

      e.stopPropagation();

      if (!$(e.target).is('input')) {
        e.preventDefault();
      }
    });

    if (boundElement.is(':disabled') || (opts.disabled === true)) {
      disable();
    }

    // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
    container.on('click', stopPropagation);

    // Handle user typed input
    [ textInput, boundElement ].forEach(function (input) {
      input.on('change', function () {
        setFromTextInput(input.val());
      });
      input.on('paste', function () {
        setTimeout(function () {
          setFromTextInput(input.val());
        }, 1);
      });
      input.on('keydown', function (e) {
        if (e.keyCode == 13) {
          setFromTextInput($(input).val());
          if (input == boundElement) hide();
        }
      });
    });

    cancelButton.text(opts.cancelText);
    cancelButton.on('click.spectrum', function (e) {
      e.stopPropagation();
      e.preventDefault();
      revert();
      hide();
    });

    clearButton.attr('title', opts.clearText);
    clearButton.on('click.spectrum', function (e) {
      e.stopPropagation();
      e.preventDefault();
      isEmpty = true;
      move();

      if (flat) {
        //for the flat style, this is a change event
        updateOriginalInput(true);
      }
    });

    chooseButton.text(opts.chooseText);
    chooseButton.on('click.spectrum', function (e) {
      e.stopPropagation();
      e.preventDefault();

      if (IE && textInput.is(':focus')) {
        textInput.trigger('change');
      }

      if (isValid()) {
        updateOriginalInput(true);
        hide();
      }
    });

    toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
    toggleButton.on('click.spectrum', function (e) {
      e.stopPropagation();
      e.preventDefault();

      opts.showPaletteOnly = !opts.showPaletteOnly;

      // To make sure the Picker area is drawn on the right, next to the
      // Palette area (and not below the palette), first move the Palette
      // to the left to make space for the picker, plus 5px extra.
      // The 'applyOptions' function puts the whole container back into place
      // and takes care of the button-text and the sp-palette-only CSS class.
      if (!opts.showPaletteOnly && !flat) {
        container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
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
      currentHue = parseFloat(dragY / slideHeight);
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
        var oldDragX = currentSaturation * dragWidth;
        var oldDragY = dragHeight - (currentValue * dragHeight);
        var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

        shiftMovementDirection = furtherFromX ? 'x' : 'y';
      }

      var setSaturation = !shiftMovementDirection || shiftMovementDirection === 'x';
      var setValue = !shiftMovementDirection || shiftMovementDirection === 'y';

      if (setSaturation) {
        currentSaturation = parseFloat(dragX / dragWidth);
      }
      if (setValue) {
        currentValue = parseFloat((dragHeight - dragY) / dragHeight);
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
      currentPreferredFormat = tinycolor(initialColor).format || opts.preferredFormat;
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

    function paletteElementClick(e) {
      if (e.data && e.data.ignore) {
        set($(e.target).closest('.sp-thumb-el').data('color'));
        move();
      } else {
        set($(e.target).closest('.sp-thumb-el').data('color'));
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

    var paletteEvent = IE ? 'mousedown.spectrum' : 'click.spectrum touchstart.spectrum';
    paletteContainer.on(paletteEvent, '.sp-thumb-el', paletteElementClick);
    initialColorContainer.on(paletteEvent, '.sp-thumb-el:nth-child(1)', { ignore: true }, paletteElementClick);
  }

  function updateSelectionPaletteFromStorage() {

    if (localStorageKey) {
      // Migrate old palettes over to new format.  May want to remove this eventually.
      try {
        var localStorage = window.localStorage;
        var oldPalette = localStorage[localStorageKey].split(',#');
        if (oldPalette.length > 1) {
          delete localStorage[localStorageKey];
          $.each(oldPalette, function (i, c) {
            addColorToSelectionPalette(c);
          });
        }
      } catch (e) {
      }

      try {
        selectionPalette = window.localStorage[localStorageKey].split(';');
      } catch (e) {
      }
    }
  }

  function addColorToSelectionPalette(color) {
    if (showSelectionPalette) {
      var rgb = tinycolor(color).toRgbString();
      if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
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

    var currentColor = get();

    var html = $.map(paletteArray, function (palette, i) {
      return paletteTemplate(palette, currentColor, 'sp-palette-row sp-palette-row-' + i, opts);
    });

    updateSelectionPaletteFromStorage();

    if (selectionPalette) {
      html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, 'sp-palette-row sp-palette-row-selection', opts));
    }

    paletteContainer.html(html.join(''));
  }

  function drawInitial() {
    if (opts.showInitial) {
      var initial = colorOnShow;
      var current = get();
      initialColorContainer.html(paletteTemplate([ initial, current ], current, 'sp-palette-row-initial', opts));
    }
  }

  function dragStart() {
    if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
      reflow();
    }
    isDragging = true;
    container.addClass(draggingClass);
    shiftMovementDirection = null;
    boundElement.trigger('dragstart.spectrum', [ get() ]);
  }

  function dragStop() {
    isDragging = false;
    container.removeClass(draggingClass);
    boundElement.trigger('dragstop.spectrum', [ get() ]);
  }

  function setFromTextInput(value) {
    if (abortNextInputChange) {
      abortNextInputChange = false;
      return;
    }
    if ((value === null || value === '') && allowEmpty) {
      set(null);
      move();
      updateOriginalInput();
    } else {
      var tiny = tinycolor(value);
      if (tiny.isValid()) {
        set(tiny);
        move();
        updateOriginalInput();
      } else {
        textInput.addClass('sp-validation-error');
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
    // debugger;
    var event = $.Event('beforeShow.spectrum');

    if (visible) {
      reflow();
      return;
    }

    boundElement.trigger(event, [ get() ]);

    if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
      return;
    }

    hideAll();
    visible = true;

    $(doc).on('keydown.spectrum', onkeydown);
    $(doc).on('click.spectrum', clickout);
    $(window).on('resize.spectrum', resize);
    replacer.addClass('sp-active');
    container.removeClass('sp-hidden');

    reflow();
    updateUI();

    colorOnShow = get();

    drawInitial();
    callbacks.show(colorOnShow);
    boundElement.trigger('show.spectrum', [ colorOnShow ]);
  }

  function onkeydown(e) {
    // Close on ESC
    if (e.keyCode === 27) {
      hide();
    }
  }

  function clickout(e) {
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

    $(doc).off('keydown.spectrum', onkeydown);
    $(doc).off('click.spectrum', clickout);
    $(window).off('resize.spectrum', resize);

    replacer.removeClass('sp-active');
    container.addClass('sp-hidden');

    callbacks.hide(get());
    boundElement.trigger('hide.spectrum', [ get() ]);
  }

  function revert() {
    set(colorOnShow, true);
    updateOriginalInput(true);
  }

  function set(color, ignoreFormatChange) {
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
      currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
    }
  }

  function get(opts) {
    opts = opts || {};

    if (allowEmpty && isEmpty) {
      return null;
    }

    return tinycolor.fromRatio({
      h: currentHue,
      s: currentSaturation,
      v: currentValue,
      a: Math.round(currentAlpha * 1000) / 1000
    }, { format: opts.format || currentPreferredFormat });
  }

  function isValid() {
    return !textInput.hasClass('sp-validation-error');
  }

  function move() {
    updateUI();

    callbacks.move(get());
    boundElement.trigger('move.spectrum', [ get() ]);
  }

  function updateUI() {

    textInput.removeClass('sp-validation-error');

    updateHelperLocations();

    // Update dragger background color (gradients take care of saturation and value).
    var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
    dragger.css('background-color', flatColor.toHexString());

    // Get a format that alpha will be included in (hex and names ignore alpha)
    var format = currentPreferredFormat;
    if (currentAlpha < 1 && !(currentAlpha === 0 && format === 'name')) {
      if (format === 'hex' || format === 'hex3' || format === 'hex6' || format === 'name') {
        format = 'rgb';
      }
    }

    var realColor = get({ format: format }),
      displayColor = '';

    //reset background info for preview element
    previewElement.removeClass('sp-clear-display');
    previewElement.css('background-color', 'transparent');

    if (!realColor && allowEmpty) {
      // Update the replaced elements background with icon indicating no color selection
      previewElement.addClass('sp-clear-display');
    } else {
      var realHex = realColor.toHexString(),
        realRgb = realColor.toRgbString();

      // Update the replaced elements background color (with actual selected color)
      if (rgbaSupport || realColor.alpha === 1) {
        previewElement.css('background-color', realRgb);
      } else {
        previewElement.css('background-color', 'transparent');
        previewElement.css('filter', realColor.toFilter());
      }

      if (opts.showAlpha) {
        var rgb = realColor.toRgb();
        rgb.a = 0;
        var realAlpha = tinycolor(rgb).toRgbString();
        var gradient = 'linear-gradient(left, ' + realAlpha + ', ' + realHex + ')';

        if (IE) {
          alphaSliderInner.css('filter', tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
        } else {
          alphaSliderInner.css('background', '-webkit-' + gradient);
          alphaSliderInner.css('background', '-moz-' + gradient);
          alphaSliderInner.css('background', '-ms-' + gradient);
          // Use current syntax gradient on unprefixed property.
          alphaSliderInner.css('background',
            'linear-gradient(to right, ' + realAlpha + ', ' + realHex + ')');
        }
      }

      displayColor = realColor.toString(format);
    }

    // Update the text entry input as it changes happen
    if (opts.showInput) {
      textInput.val(displayColor);
    }
    boundElement.val(displayColor);
    if (opts.type == 'text' || opts.type == 'component') {
      var color = realColor;
      if (color && colorizeElement) {
        var textColor = (color.isLight() || color.getAlpha() < 0.4) ? 'black' : 'white';
        colorizeElement.css('background-color', color.toRgbString()).css('color', textColor);
      } else {
        colorizeElement.css('background-color', colorizeElementInitialBackground)
          .css('color', colorizeElementInitialColor);
      }
    }

    if (opts.showPalette) {
      drawPalette();
    }

    drawInitial();
  }

  function updateHelperLocations() {
    var s = currentSaturation;
    var v = currentValue;

    if (allowEmpty && isEmpty) {
      //if selected color is empty, hide the helpers
      alphaSlideHelper.hide();
      slideHelper.hide();
      dragHelper.hide();
    } else {
      //make sure helpers are visible
      alphaSlideHelper.show();
      slideHelper.show();
      dragHelper.show();

      // Where to show the little circle in that displays your current selected color
      var dragX = s * dragWidth;
      var dragY = dragHeight - (v * dragHeight);
      dragX = Math.max(
        -dragHelperHeight,
        Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
      );
      dragY = Math.max(
        -dragHelperHeight,
        Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
      );
      dragHelper.css({
        'top': dragY + 'px',
        'left': dragX + 'px'
      });

      var alphaX = currentAlpha * alphaWidth;
      alphaSlideHelper.css({
        'left': (alphaX - (alphaSlideHelperWidth / 2)) + 'px'
      });

      // Where to show the bar that displays your current selected hue
      var slideY = (currentHue) * slideHeight;
      slideHelper.css({
        'top': (slideY - slideHelperHeight) + 'px'
      });
    }
  }

  function updateOriginalInput(fireCallback) {
    var color = get(),
      displayColor = '',
      hasChanged = !tinycolor.equals(color, colorOnShow);

    if (color) {
      displayColor = color.toString(currentPreferredFormat);
      // Update the selection palette with the current color
      addColorToSelectionPalette(color);
    }

    if (fireCallback && hasChanged) {
      callbacks.change(color);
      // we trigger the change event or input, but the input change event is also binded
      // to some spectrum processing, that we do no need
      abortNextInputChange = true;
      boundElement.trigger('change', [ color ]);
    }
  }

  function reflow() {
    if (!visible) {
      return; // Calculations would be useless and wouldn't be reliable anyways
    }
    dragWidth = dragger.width();
    dragHeight = dragger.height();
    dragHelperHeight = dragHelper.height();
    slideWidth = slider.width();
    slideHeight = slider.height();
    slideHelperHeight = slideHelper.height();
    alphaWidth = alphaSlider.width();
    alphaSlideHelperWidth = alphaSlideHelper.width();

    if (!flat) {
      container.css('position', 'absolute');
      if (opts.offset) {
        container.offset(opts.offset);
      } else {
        container.offset(getOffset(container, offsetElement));
      }
    }

    updateHelperLocations();

    if (opts.showPalette) {
      drawPalette();
    }

    boundElement.trigger('reflow.spectrum');
  }

  function destroy() {
    boundElement.show().removeClass('spectrum with-add-on sp-colorize');
    offsetElement.off('click.spectrum touchstart.spectrum');
    container.remove();
    replacer.remove();
    if (colorizeElement) {
      colorizeElement.css('background-color', colorizeElementInitialBackground)
        .css('color', colorizeElementInitialColor);
    }
    var originalInputContainer = boundElement.closest('.sp-original-input-container');
    if (originalInputContainer.length > 0) {
      originalInputContainer.after(boundElement).remove();
    }
    spectrums[spect.id] = null;
  }

  function option(optionName, optionValue) {
    if (optionName === undefined) {
      return $.extend({}, opts);
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
    boundElement.attr('disabled', false);
    offsetElement.removeClass('sp-disabled');
  }

  function disable() {
    hide();
    disabled = true;
    boundElement.attr('disabled', true);
    offsetElement.addClass('sp-disabled');
  }

  function setOffset(coord) {
    opts.offset = coord;
    reflow();
  }

  initialize();

  var spect = {
    show: show,
    hide: hide,
    toggle: toggle,
    reflow: reflow,
    option: option,
    enable: enable,
    disable: disable,
    offset: setOffset,
    set: function (c) {
      set(c);
      updateOriginalInput();
    },
    get: get,
    destroy: destroy,
    container: container
  };

  spect.id = spectrums.push(spect) - 1;

  return spect;
}

/**
 * checkOffset - get the offset below/above and left/right element depending on screen position
 * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
 */
function getOffset(picker, input) {
  var extraY = 0;
  var dpWidth = picker.outerWidth();
  var dpHeight = picker.outerHeight();
  var inputHeight = input.outerHeight();
  var doc = picker[0].ownerDocument;
  var docElem = doc.documentElement;
  var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
  var viewHeight = docElem.clientHeight + $(doc).scrollTop();
  var offset = input.offset();
  var offsetLeft = offset.left;
  var offsetTop = offset.top;

  offsetTop += inputHeight;

  offsetLeft -=
    Math.min(offsetLeft, (offsetLeft + dpWidth > viewWidth && viewWidth > dpWidth) ?
      Math.abs(offsetLeft + dpWidth - viewWidth) : 0);

  offsetTop -=
    Math.min(offsetTop, ((offsetTop + dpHeight > viewHeight && viewHeight > dpHeight) ?
      Math.abs(dpHeight + inputHeight - extraY) : extraY));

  return {
    top: offsetTop,
    bottom: offset.bottom,
    left: offsetLeft,
    right: offset.right,
    width: offset.width,
    height: offset.height
  };
}

/**
 * noop - do nothing
 */
function noop() {

}

/**
 * stopPropagation - makes the code only doing this a little easier to read in line
 */
function stopPropagation(e) {
  e.stopPropagation();
}

/**
 * Create a function bound to a given object
 * Thanks to underscore.js
 */
function bind(func: Function, obj: object) {
  var slice = Array.prototype.slice;
  var args = slice.call(arguments, 2);
  return function () {
    return func.apply(obj, args.concat(slice.call(arguments)));
  };
}

/**
 * Lightweight drag helper.  Handles containment within the element, so that
 * when dragging, the x is within [0,element.width] and y is within [0,element.height]
 */
function draggable(element, onmove, onstart, onstop) {
  onmove = onmove || function () {
  };
  onstart = onstart || function () {
  };
  onstop = onstop || function () {
  };
  var doc = document;
  var dragging = false;
  var offset = {};
  var maxHeight = 0;
  var maxWidth = 0;
  var hasTouch = ('ontouchstart' in window);

  var duringDragEvents = {};
  duringDragEvents['selectstart'] = prevent;
  duringDragEvents['dragstart'] = prevent;
  duringDragEvents['touchmove mousemove'] = move;
  duringDragEvents['touchend mouseup'] = stop;

  function prevent(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.returnValue = false;
  }

  function move(e) {
    if (dragging) {
      // Mouseup happened outside of window
      if (IE && doc.documentMode < 9 && !e.button) {
        return stop();
      }

      var t0 = e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0];
      var pageX = t0 && t0.pageX || e.pageX;
      var pageY = t0 && t0.pageY || e.pageY;

      var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
      var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

      if (hasTouch) {
        // Stop scrolling in iOS
        prevent(e);
      }

      onmove.apply(element, [ dragX, dragY, e ]);
    }
  }

  function start(e) {
    var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

    if (!rightclick && !dragging) {
      if (onstart.apply(element, arguments) !== false) {
        dragging = true;
        maxHeight = $(element).height();
        maxWidth = $(element).width();
        offset = $(element).offset();

        $(doc).on(duringDragEvents);
        $(doc.body).addClass('sp-dragging');

        move(e);

        prevent(e);
      }
    }
  }

  function stop() {
    if (dragging) {
      $(doc).off(duringDragEvents);
      $(doc.body).removeClass('sp-dragging');

      // Wait a tick before notifying observers to allow the click event
      // to fire in Chrome.
      setTimeout(function () {
        onstop.apply(element, arguments);
      }, 0);
    }
    dragging = false;
  }

  $(element).on('touchstart mousedown', start);
}

function inputTypeColorSupport() {
  return $.fn.spectrum.inputTypeColorSupport();
}

/**
 * Define a jQuery plugin
 */
var dataID = 'spectrum.id';
$.fn.spectrum = function (opts, extra) {

  if (typeof opts == 'string') {

    var returnValue = this;
    var args = Array.prototype.slice.call(arguments, 1);

    this.each(function () {
      var spect = spectrums[$(this).data(dataID)];
      if (spect) {
        var method = spect[opts];
        if (!method) {
          throw new Error('Spectrum: no such method: \'' + opts + '\'');
        }

        if (opts == 'get') {
          returnValue = spect.get();
        } else if (opts == 'container') {
          returnValue = spect.container;
        } else if (opts == 'option') {
          returnValue = spect.option.apply(spect, args);
        } else if (opts == 'destroy') {
          spect.destroy();
          $(this).removeData(dataID);
        } else {
          method.apply(spect, args);
        }
      }
    });

    return returnValue;
  }

  // Initializing a new instance of spectrum
  return this.spectrum('destroy').each(function () {
    var options = $.extend({}, $(this).data(), opts);
    // Infer default type from input params and deprecated options
    if (!$(this).is('input')) options.type = 'noInput';
    else if (options.flat || options.type == 'flat') options.type = 'flat';
    else if ($(this).attr('type') == 'color') options.type = 'color';
    else options.type = options.type || 'component';

    var spect = spectrum(this, options);
    $(this).data(dataID, spect.id);
  });
};

$.fn.spectrum.load = true;
$.fn.spectrum.loadOpts = {};
$.fn.spectrum.draggable = draggable;
$.fn.spectrum.defaults = defaultOpts;
$.fn.spectrum.inputTypeColorSupport = function inputTypeColorSupport() {
  if (typeof inputTypeColorSupport._cachedResult === 'undefined') {
    var colorInput = $('<input type=\'color\'/>')[0]; // if color element is supported, value will default to not null
    inputTypeColorSupport._cachedResult = colorInput.type === 'color' && colorInput.value !== '';
  }
  return inputTypeColorSupport._cachedResult;
};

// $.spectrum = {};
// $.spectrum.localization = {};
// $.spectrum.palettes = {};

// $.fn.spectrum.processNativeColorInputs = function () {
//   var colorInputs = $('input[type=color]');
//   if (colorInputs.length && !inputTypeColorSupport()) {
//     colorInputs.spectrum({
//       preferredFormat: 'hex6'
//     });
//   }
// };

