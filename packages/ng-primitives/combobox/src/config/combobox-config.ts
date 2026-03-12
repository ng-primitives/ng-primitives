import { InjectionToken, Provider, inject } from '@angular/core';
import type { Middleware } from '@floating-ui/dom';
import { NgpDismissGuard, NgpFlip, NgpOffset, NgpShift } from 'ng-primitives/portal';
import { type NgpComboboxPlacement } from '../combobox/combobox';

export interface NgpComboboxConfig {
  /**
   * The default placement for the combobox dropdown.
   * @default 'bottom'
   */
  placement: NgpComboboxPlacement;

  /**
   * The container element or selector for the combobox dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Whether the combobox dropdown should flip when there is not enough space.
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

export const defaultComboboxConfig: NgpComboboxConfig = {
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

export const NgpComboboxConfigToken = new InjectionToken<NgpComboboxConfig>(
  'NgpComboboxConfigToken',
);

/**
 * Provide the default Combobox configuration
 * @param config The Combobox configuration
 * @returns The provider
 */
export function provideComboboxConfig(config: Partial<NgpComboboxConfig>): Provider[] {
  return [
    {
      provide: NgpComboboxConfigToken,
      useValue: { ...defaultComboboxConfig, ...config },
    },
  ];
}

/**
 * Inject the Combobox configuration
 * @returns The global Combobox configuration
 */
export function injectComboboxConfig(): NgpComboboxConfig {
  return inject(NgpComboboxConfigToken, { optional: true }) ?? defaultComboboxConfig;
}
