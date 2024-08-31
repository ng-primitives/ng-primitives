/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';
import { type Placement } from '@floating-ui/dom';

export interface NgpTooltipConfig {
  /**
   * Define the offset of the tooltip relative to the trigger.
   * @default 4
   */
  offset: number;

  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  placement: Placement;

  /**
   * Define the delay before the tooltip is shown.
   * @default 0
   */
  showDelay: number;

  /**
   * Define the delay before the tooltip is hidden.
   * @default 0
   */
  hideDelay: number;

  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * @default true
   */
  flip: boolean;

  /**
   * Define the container in to which the tooltip should be attached.
   * @default document.body
   */
  container: HTMLElement | null;
}

export const defaultTooltipConfig: NgpTooltipConfig = {
  offset: 4,
  placement: 'top',
  showDelay: 0,
  hideDelay: 0,
  flip: true,
  container: null,
};

export const NgpTooltipConfigToken = new InjectionToken<NgpTooltipConfig>('NgpTooltipConfigToken');

/**
 * Provide the default Tooltip configuration
 * @param config The Tooltip configuration
 * @returns The provider
 */
export function provideTooltipConfig(config: Partial<NgpTooltipConfig>): Provider[] {
  return [
    {
      provide: NgpTooltipConfigToken,
      useValue: { ...defaultTooltipConfig, ...config },
    },
  ];
}

/**
 * Inject the Tooltip configuration
 * @returns The global Tooltip configuration
 */
export function injectTooltipConfig(): NgpTooltipConfig {
  return inject(NgpTooltipConfigToken, { optional: true }) ?? defaultTooltipConfig;
}
