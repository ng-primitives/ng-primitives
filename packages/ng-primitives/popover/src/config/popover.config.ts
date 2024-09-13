/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';
import { type Placement } from '@floating-ui/dom';

export interface NgpPopoverConfig {
  /**
   * Define the offset of the popover relative to the trigger.
   * @default 4
   */
  offset: number;

  /**
   * Define the placement of the popover relative to the trigger.
   * @default 'bottom'
   */
  placement: Placement;

  /**
   * Define the delay before the popover is shown.
   * @default 0
   */
  showDelay: number;

  /**
   * Define the delay before the popover is hidden.
   * @default 0
   */
  hideDelay: number;

  /**
   * Define whether the popover should flip when there is not enough space for the popover.
   * @default true
   */
  flip: boolean;

  /**
   * Define the container in to which the popover should be attached.
   * @default document.body
   */
  container: HTMLElement | null;

  /**
   * Define whether the popover should close when clicking outside of it.
   * @default true
   */
  closeOnOutsideClick: boolean;
}

export const defaultPopoverConfig: NgpPopoverConfig = {
  offset: 4,
  placement: 'bottom',
  showDelay: 0,
  hideDelay: 0,
  flip: true,
  container: null,
  closeOnOutsideClick: true,
};

export const NgpPopoverConfigToken = new InjectionToken<NgpPopoverConfig>('NgpPopoverConfigToken');

/**
 * Provide the default Popover configuration
 * @param config The Popover configuration
 * @returns The provider
 */
export function providePopoverConfig(config: Partial<NgpPopoverConfig>): Provider[] {
  return [
    {
      provide: NgpPopoverConfigToken,
      useValue: { ...defaultPopoverConfig, ...config },
    },
  ];
}

/**
 * Inject the Popover configuration
 * @returns The global Popover configuration
 */
export function injectPopoverConfig(): NgpPopoverConfig {
  return inject(NgpPopoverConfigToken, { optional: true }) ?? defaultPopoverConfig;
}
