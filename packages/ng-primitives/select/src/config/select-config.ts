import { InjectionToken, Provider, inject } from '@angular/core';
import type { Middleware, Placement } from '@floating-ui/dom';
import { NgpDismissGuard, NgpFlip, NgpOffset, NgpShift } from 'ng-primitives/portal';

export interface NgpSelectConfig {
  /**
   * The default placement for the select dropdown.
   * @default 'bottom'
   */
  placement: Placement;

  /**
   * The container element or selector for the select dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Whether the select dropdown should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with detailed options.
   * @default true
   */
  flip: NgpFlip;

  /**
   * Define the offset from the trigger element.
   * @default 0
   */
  offset: NgpOffset;

  /**
   * Configure shift behavior to keep the dropdown in view.
   * @default undefined (enabled by default)
   */
  shift: NgpShift;

  /**
   * Defines how the dropdown behaves when the window is scrolled.
   * @default 'reposition'
   */
  scrollBehavior: 'reposition' | 'block' | 'close';

  /**
   * Whether clicking outside the dropdown closes it.
   * @default true
   */
  closeOnOutsideClick: NgpDismissGuard<Element>;

  /**
   * Whether pressing Escape closes the dropdown.
   * @default true
   */
  closeOnEscape: NgpDismissGuard<KeyboardEvent>;

  /**
   * Additional Floating UI middleware for custom positioning.
   */
  middleware: Middleware[];
}

export const defaultSelectConfig: NgpSelectConfig = {
  placement: 'bottom',
  container: 'body',
  flip: true,
  offset: 0,
  shift: undefined,
  scrollBehavior: 'reposition',
  closeOnOutsideClick: true,
  closeOnEscape: true,
  middleware: [],
};

export const NgpSelectConfigToken = new InjectionToken<NgpSelectConfig>('NgpSelectConfigToken');

/**
 * Provide the default Select configuration
 * @param config The Select configuration
 * @returns The provider
 */
export function provideSelectConfig(config: Partial<NgpSelectConfig>): Provider[] {
  return [
    {
      provide: NgpSelectConfigToken,
      useValue: { ...defaultSelectConfig, ...config },
    },
  ];
}

/**
 * Inject the Select configuration
 * @returns The global Select configuration
 */
export function injectSelectConfig(): NgpSelectConfig {
  return inject(NgpSelectConfigToken, { optional: true }) ?? defaultSelectConfig;
}
