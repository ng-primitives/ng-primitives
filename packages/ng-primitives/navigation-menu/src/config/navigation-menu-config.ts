import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';

export interface NgpNavigationMenuConfig {
  /**
   * The orientation of the navigation menu.
   * @default 'horizontal'
   */
  orientation: NgpOrientation;

  /**
   * Define the delay before the content is shown.
   * @default 200
   */
  showDelay: number;

  /**
   * How much time a user has to enter another trigger without incurring a delay again.
   * @default 300
   */
  skipDelayDuration: number;
}

export const defaultNavigationMenuConfig: NgpNavigationMenuConfig = {
  orientation: 'horizontal',
  showDelay: 200,
  skipDelayDuration: 300,
};

export const NgpNavigationMenuConfigToken = new InjectionToken<NgpNavigationMenuConfig>(
  'NgpNavigationMenuConfigToken',
);

/**
 * Provide the default Navigation Menu configuration
 * @param config The Navigation Menu configuration
 * @returns The provider
 */
export function provideNavigationMenuConfig(
  config: Partial<NgpNavigationMenuConfig>,
): Provider[] {
  return [
    {
      provide: NgpNavigationMenuConfigToken,
      useValue: { ...defaultNavigationMenuConfig, ...config },
    },
  ];
}

/**
 * Inject the Navigation Menu configuration
 * @returns The global Navigation Menu configuration
 */
export function injectNavigationMenuConfig(): NgpNavigationMenuConfig {
  return inject(NgpNavigationMenuConfigToken, { optional: true }) ?? defaultNavigationMenuConfig;
}
