import { InjectionToken, Provider, inject } from '@angular/core';
import type { Placement } from '@floating-ui/dom';

export interface NgpComboboxConfig {
  /**
   * The default placement for the combobox dropdown.
   * @default 'bottom'
   */
  placement: Placement;

  /**
   * The container for the combobox dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default document.body
   */
  container: HTMLElement | null;
}

export const defaultComboboxConfig: NgpComboboxConfig = {
  placement: 'bottom',
  container: null,
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
