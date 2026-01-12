import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';

export interface NgpToggleGroupConfig {
  /**
   * The orientation of the toggle group.
   * @default 'horizontal'
   */
  orientation: NgpOrientation;

  /**
   * The type of the toggle group, whether only one item can be selected or multiple.
   * @default 'single'
   */
  type: 'single' | 'multiple';

  /**
   * Whether a toggle button can be deselected.
   * @default true
   */
  allowDeselection: boolean;

  /**
   * Whether focus should wrap around when reaching the end of the toggle group.
   * @default true
   */
  wrap: boolean;
}

export const defaultToggleGroupConfig: NgpToggleGroupConfig = {
  orientation: 'horizontal',
  type: 'single',
  allowDeselection: true,
  wrap: true,
};

export const NgpToggleGroupConfigToken = new InjectionToken<NgpToggleGroupConfig>(
  'NgpToggleGroupConfigToken',
);

/**
 * Provide the default ToggleGroup configuration
 * @param config The ToggleGroup configuration
 * @returns The provider
 */
export function provideToggleGroupConfig(config: Partial<NgpToggleGroupConfig>): Provider[] {
  return [
    {
      provide: NgpToggleGroupConfigToken,
      useValue: { ...defaultToggleGroupConfig, ...config },
    },
  ];
}

/**
 * Inject the ToggleGroup configuration
 * @returns The global ToggleGroup configuration
 */
export function injectToggleGroupConfig(): NgpToggleGroupConfig {
  return inject(NgpToggleGroupConfigToken, { optional: true }) ?? defaultToggleGroupConfig;
}
