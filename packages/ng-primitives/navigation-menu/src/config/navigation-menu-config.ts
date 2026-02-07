import { InjectionToken, Provider, inject } from '@angular/core';
import { type Placement } from '@floating-ui/dom';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpOffset, NgpShift } from 'ng-primitives/portal';

export interface NgpNavigationMenuConfig {
  /**
   * Define the orientation of the navigation menu.
   * @default 'horizontal'
   */
  orientation: NgpOrientation;

  /**
   * Define the delay in milliseconds before the content is shown.
   * @default 200
   */
  showDelay: number;

  /**
   * Define the delay in milliseconds before the content is hidden.
   * @default 150
   */
  hideDelay: number;

  /**
   * Define the placement of the content relative to the trigger.
   * @default 'bottom-start'
   */
  placement: Placement;

  /**
   * Define the offset of the content relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  offset: NgpOffset;

  /**
   * Define whether the content should flip when there is not enough space.
   * @default true
   */
  flip: boolean;

  /**
   * Configure shift behavior to keep the content in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * Define the container element or selector in to which the content should be attached.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Whether focus should wrap around when reaching the end of the list.
   * @default true
   */
  wrap: boolean;

  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one navigation menu item to another within this duration,
   * the showDelay is skipped for the new item.
   * @default 300
   */
  cooldown: number;
}

export const defaultNavigationMenuConfig: NgpNavigationMenuConfig = {
  orientation: 'horizontal',
  showDelay: 200,
  hideDelay: 150,
  placement: 'bottom-start',
  offset: 4,
  flip: true,
  shift: undefined,
  container: 'body',
  wrap: true,
  cooldown: 300,
};

export const NgpNavigationMenuConfigToken = new InjectionToken<NgpNavigationMenuConfig>(
  'NgpNavigationMenuConfigToken',
);

/**
 * Provide the default NavigationMenu configuration
 * @param config The NavigationMenu configuration
 * @returns The provider
 */
export function provideNavigationMenuConfig(config: Partial<NgpNavigationMenuConfig>): Provider[] {
  return [
    {
      provide: NgpNavigationMenuConfigToken,
      useValue: { ...defaultNavigationMenuConfig, ...config },
    },
  ];
}

/**
 * Inject the NavigationMenu configuration
 * @returns The global NavigationMenu configuration
 */
export function injectNavigationMenuConfig(): NgpNavigationMenuConfig {
  return inject(NgpNavigationMenuConfigToken, { optional: true }) ?? defaultNavigationMenuConfig;
}
