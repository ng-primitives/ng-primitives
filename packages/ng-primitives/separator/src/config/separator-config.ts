import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';

export interface NgpSeparatorConfig {
  /**
   * The default separator orientation
   * @default 'horizontal'
   */
  orientation: NgpOrientation;
}

export const defaultSeparatorConfig: NgpSeparatorConfig = {
  orientation: 'horizontal',
};

export const NgpSeparatorConfigToken = new InjectionToken<NgpSeparatorConfig>(
  'NgpSeparatorConfigToken',
);

/**
 * Provide the default Separator configuration
 * @param config The Separator configuration
 * @returns The provider
 */
export function provideSeparatorConfig(config: Partial<NgpSeparatorConfig>): Provider[] {
  return [
    {
      provide: NgpSeparatorConfigToken,
      useValue: { ...defaultSeparatorConfig, ...config },
    },
  ];
}

/**
 * Inject the Separator configuration
 * @returns The global Separator configuration
 */
export function injectSeparatorConfig(): NgpSeparatorConfig {
  return inject(NgpSeparatorConfigToken, { optional: true }) ?? defaultSeparatorConfig;
}
