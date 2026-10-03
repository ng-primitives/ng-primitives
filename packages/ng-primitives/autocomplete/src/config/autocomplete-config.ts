import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpFlip, NgpOffset } from 'ng-primitives/portal';
import { type NgpAutocompletePlacement } from '../autocomplete/autocomplete';

export interface NgpAutocompleteConfig {
  /**
   * The default placement for the autocomplete dropdown.
   * @default 'bottom'
   */
  placement: NgpAutocompletePlacement;

  /**
   * The container element or selector for the autocomplete dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Whether the autocomplete dropdown should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  flip: NgpFlip;

  /**
   * Define the offset of the autocomplete dropdown relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  offset: NgpOffset;
}

export const defaultAutocompleteConfig: NgpAutocompleteConfig = {
  placement: 'bottom',
  container: 'body',
  flip: true,
  offset: 0,
};

export const NgpAutocompleteConfigToken = new InjectionToken<NgpAutocompleteConfig>(
  'NgpAutocompleteConfigToken',
);

/**
 * Provide the default Autocomplete configuration
 * @param config The Autocomplete configuration
 * @returns The provider
 */
export function provideAutocompleteConfig(config: Partial<NgpAutocompleteConfig>): Provider[] {
  return [
    {
      provide: NgpAutocompleteConfigToken,
      useValue: { ...defaultAutocompleteConfig, ...config },
    },
  ];
}

/**
 * Inject the Autocomplete configuration
 * @returns The global Autocomplete configuration
 */
export function injectAutocompleteConfig(): NgpAutocompleteConfig {
  return inject(NgpAutocompleteConfigToken, { optional: true }) ?? defaultAutocompleteConfig;
}
