import { InjectionToken, Provider, inject } from '@angular/core';
import {
  NgpFlip,
  NgpOffset,
  NgpPlacement,
  NgpScrollBehavior,
  NgpShift,
} from 'ng-primitives/portal';

export interface NgpSelectConfig {
  /**
   * The default placement for the select dropdown.
   * @default 'bottom'
   */
  placement: NgpPlacement;

  /**
   * The container element or selector for the select dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Whether the select dropdown should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  flip: NgpFlip;

  /**
   * Define the offset of the select dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  offset: NgpOffset;

  /**
   * Configure shift behavior to keep the select dropdown in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * Defines how the select dropdown behaves when the window is scrolled.
   * @default 'reposition'
   */
  scrollBehavior: NgpScrollBehavior;
}

export const defaultSelectConfig: NgpSelectConfig = {
  placement: 'bottom',
  container: 'body',
  flip: true,
  offset: 0,
  shift: undefined,
  scrollBehavior: 'reposition',
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
