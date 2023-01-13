/**
 * Part of spectrum-vanilla project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */
export declare function insertAfter<T extends Element>(existingNode: T, newNode: Element): T;
export declare function insertBefore<T extends Element>(existingNode: T, newNode: Element): T;
export declare function wrap<T extends Element>(ele: T, wrapper: Element): T;
export declare function outerWidthWithMargin(ele: HTMLElement): number;
