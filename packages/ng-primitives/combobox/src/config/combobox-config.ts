import { InjectionToken, Provider, inject } from '@angular/core';
import {
  NgpFlip,
  NgpOffset,
  NgpPlacement,
  NgpScrollBehavior,
  NgpShift,
} from 'ng-primitives/portal';

export interface NgpComboboxConfig {
  /**
   * The default placement for the combobox dropdown.
   * @default 'bottom'
   */
  placement: NgpPlacement;

  /**
   * The container element or selector for the combobox dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Whether the combobox dropdown should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  flip: NgpFlip;

  /**
   * Define the offset of the combobox dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  offset: NgpOffset;

  /**
   * Configure shift behavior to keep the combobox dropdown in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * Defines how the combobox dropdown behaves when the window is scrolled.
   * @default 'reposition'
   */
  scrollBehavior: NgpScrollBehavior;
}

export const defaultComboboxConfig: NgpComboboxConfig = {
  placement: 'bottom',
  container: 'body',
  flip: true,
  offset: 0,
  shift: undefined,
  scrollBehavior: 'reposition',
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
