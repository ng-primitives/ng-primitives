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

  /**
   * Define whether the popover should close when the escape key is pressed.
   * @default true
   */
  closeOnEscape: boolean;

  /**
   * Defines how the popover behaves when the window is scrolled.
   * @default scroll
   */
  scrollBehavior: 'reposition' | 'block';
}

export const defaultPopoverConfig: NgpPopoverConfig = {
  offset: 4,
  placement: 'bottom',
  showDelay: 0,
  hideDelay: 0,
  flip: true,
  container: null,
  closeOnOutsideClick: true,
  closeOnEscape: true,
  scrollBehavior: 'reposition',
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
