import { InjectionToken, Provider, inject } from '@angular/core';
import type { Placement } from '@floating-ui/dom';

export interface NgpSelectConfig {
  /**
   * The default placement for the select dropdown.
   * @default 'bottom'
   */
  placement: Placement;

  /**
   * The container for the select dropdown.
   * This can be used to control where the dropdown is rendered in the DOM.
   * @default document.body
   */
  container: HTMLElement | null;
}

export const defaultSelectConfig: NgpSelectConfig = {
  placement: 'bottom',
  container: null,
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
