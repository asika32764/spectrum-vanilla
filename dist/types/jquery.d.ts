/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */

import { SpectrumOptions } from './types';

/// <reference types="jquery"/>
/// <reference types="tinycolor2"/>

// tslint:disable:unified-signatures self-documenting code and JSDoc require non-unified signatures
interface JQuery {
  /**
   * Shows the color picker.
   *
   * @param methodName Name of the method to call, i.e. `show`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "show"): JQuery;

  /**
   * Hides the color picker.
   *
   * @param methodName Name of the method to call, i.e. `hide`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "hide"): JQuery;

  /**
   * Toggles the color picker.
   *
   * Warning: If you are calling toggle from a click handler, make sure you
   * return `false` to prevent the color picker from immediately hiding after
   * it is toggled.
   *
   * ```javascript
   * $("#btn-toggle").click(function() {
   *   $("#toggle").spectrum("toggle");
   *   return false;
   * });
   * ```
   *
   * @param methodName Name of the method to call, i.e. `toggle`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "toggle"): JQuery;

  /**
   * Gets the current value from the color picker.
   *
   * @param methodName Name of the method to call, i.e. `get`.
   * @return The currently selected color.
   */
  spectrum(methodName: "get"): tinycolor.Instance;

  /**
   * Sets the color picker's value to update the original input.
   *
   * Note: This will not fire the `change` event, to prevent infinite loops
   * from calling `set` from within `change`.
   *
   * ```html
   * <input type='text' value='blanchedalmond' name='triggerSet' id='triggerSet' />
   * <input type='text' placeholder='Enter A Color' id='enterAColor' />
   * <button id='btnEnterAColor'>Trigger Set</button>
   * <script>
   *   $("#triggerSet").spectrum();
   *
   * // Show the original input to demonstrate the
   *   // value changing when calling `set`
   *   $("#triggerSet").show();
   *
   *   $("#btnEnterAColor").click(function() {
   *     $("#triggerSet").spectrum("set", $("#enterAColor").val());
   *   });
   * </script>
   * ```
   *
   * @param methodName Name of the method to call, i.e. `set`.
   * @param colorString The new color for the color picker. When not given,
   * resets the color to the default color.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "set", colorString?: string): JQuery;

  /**
   * Retrieves the container element of the color picker, in case you want to
   * manually position it or do other things.
   *
   * @param methodName Name of the method to call, i.e. `container`.
   * @return The JQuery element representing the container DOM element of the
   * color picker.
   */
  spectrum(methodName: "container"): JQuery;

  /**
   * Resets the positioning of the container element.
   *
   * This could be used if the color picker was hidden when initialized, or if
   * the color picker is inside of a moving area.
   *
   * @param methodName Name of the method to call, i.e. `reflow`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "reflow"): JQuery;

  /**
   * Removes the color picker functionality and restores the element to its
   * original state.
   *
   * @param methodName Name of the method to call, i.e. `destroy`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "destroy"): JQuery;

  /**
   * Allows selection of the color picker component. if it is already enabled,
   * this method does nothing.
   *
   * Additionally, this will cause the original (now hidden) input to be set
   * as disabled.
   *
   * @param methodName Name of the method to call, i.e. `enable`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "enable"): JQuery;

  /**
   * Disables selection of the color picker component. Adds the `sp-disabled`
   * class to the replacer element. If it is already disabled, this method
   * does nothing.
   *
   * Additionally, this will remove the `disabled` property on the original
   * now hidden).
   *
   * @param methodName Name of the method to call, i.e. `disable`.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum(methodName: "disable"): JQuery;

  /**
   * Retrieves the set of options currently set on the color picker.
   *
   * @param methodName Name of the method to call, i.e. `option`.
   * @return An object with all options currently set on the color picker.
   */
  spectrum(methodName: "option"): SpectrumOptions;

  /**
   * Retrieves the current value for the option with the given name.
   *
   * ```javascript
   * $("input").spectrum({
   *   showInput: true
   * });
   * $("input").spectrum("option", "showInput"); // true
   * ```
   *
   * @param methodName Name of the method to call, i.e. `option`.
   * @param optionName Name of the option for which to retrieve the value.
   * @return The current value for the given option.
   */
  spectrum<K extends keyof SpectrumOptions>(
    methodName: "option",
    optionName: K
  ): SpectrumOptions[K];

  /**
   * Sets the value of the option with the given name to the given value.
   *
   * ```javascript
   * $("input").spectrum({
   *   showInput: true
   * });
   * $("input").spectrum("option", "showInput", false);
   * $("input").spectrum("option", "showInput"); // false
   * ```
   *
   * @param optionName Name of the option to set.
   * @param newOptionValue the new value for the option. This must not be
   * `undefined`, or the current value of the option will be returned.
   * @return This JQuery instance for chaining method calls.
   */
  spectrum<K extends keyof SpectrumOptions>(
    methodName: "option",
    optionName: K,
    newOptionValue: NonNullable<SpectrumOptions[K]>
  ): JQuery;

  /**
   * Initializes the input element that it is called on as a spectrum color
   * picker instance.
   *
   * Just create a normal input and initialize it as a normal jQuery plugin.
   * You can set a lot of options when initializing the color picker.
   *
   * ```html
   * <input type='text' id="custom" />
   *
   * <script>
   * $("#custom").spectrum({
   *   color: "#f00"
   * });
   * </script>
   * ```
   */
  spectrum(options?: SpectrumOptions): JQuery;
}
