import { InjectionToken, Provider, inject } from '@angular/core';
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
  flip: boolean;
}

export const defaultComboboxConfig: NgpComboboxConfig = {
  placement: 'bottom',
  container: 'body',
  flip: true,
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
