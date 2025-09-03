import { InjectionToken, Provider, inject } from '@angular/core';
import { Placement } from '@floating-ui/dom';

export interface NgpMenuConfig {
  /**
   * Define the offset of the menu relative to the trigger.
   * @default 4
   */
  offset: number;

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'bottom-start'
   */
  placement: Placement;

  /**
   * Define whether the menu should flip when there is not enough space for the menu.
   * @default true
   */
  flip: boolean;

  /**
   * Define the container element or selector in to which the menu should be attached.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Defines how the menu behaves when the window is scrolled.
   * @default scroll
   */
  scrollBehavior: 'reposition' | 'block';
}

export const defaultMenuConfig: NgpMenuConfig = {
  offset: 4,
  placement: 'bottom-start',
  flip: true,
  container: 'body',
  scrollBehavior: 'block',
};

export const NgpMenuConfigToken = new InjectionToken<NgpMenuConfig>('NgpMenuConfigToken');

/**
 * Provide the default Menu configuration
 * @param config The Menu configuration
 * @returns The provider
 */
export function provideMenuConfig(config: Partial<NgpMenuConfig>): Provider[] {
  return [
    {
      provide: NgpMenuConfigToken,
      useValue: { ...defaultMenuConfig, ...config },
    },
  ];
}

/**
 * Inject the Menu configuration
 * @returns The global Menu configuration
 */
export function injectMenuConfig(): NgpMenuConfig {
  return inject(NgpMenuConfigToken, { optional: true }) ?? defaultMenuConfig;
}
