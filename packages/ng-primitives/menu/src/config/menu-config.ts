import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpOffset, NgpShift } from 'ng-primitives/portal';
import type { NgpMenuPlacement } from '../menu-trigger/menu-trigger';

export interface NgpMenuConfig {
  /**
   * Define the offset of the menu relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  offset: NgpOffset;

  /**
   * Define the placement of the menu relative to the trigger.
   * @default 'bottom-start'
   */
  placement: NgpMenuPlacement;

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

  /**
   * Configure shift behavior to keep the menu in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * Whether focus should wrap around when reaching the end of the menu.
   * @default true
   */
  wrap: boolean;

  /**
   * Cooldown duration in milliseconds.
   * When moving from one menu to another within this duration,
   * the showDelay is skipped for the new menu.
   * @default 0
   */
  cooldown: number;
}

export const defaultMenuConfig: NgpMenuConfig = {
  offset: 4,
  placement: 'bottom-start',
  flip: true,
  container: 'body',
  scrollBehavior: 'block',
  shift: undefined,
  wrap: true,
  cooldown: 0,
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
