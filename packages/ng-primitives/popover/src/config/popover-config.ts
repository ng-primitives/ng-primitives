import { InjectionToken, Provider, inject } from '@angular/core';
import { type Placement } from '@floating-ui/dom';
import { NgpOffset, NgpShift } from 'ng-primitives/portal';

export interface NgpPopoverConfig {
  /**
   * Define the offset of the popover relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  offset: NgpOffset;

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
   * Define the container element or selector in to which the popover should be attached.
   * @default 'body'
   */
  container: HTMLElement | string | null;

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

  /**
   * Configure shift behavior to keep the popover in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * Whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  trackPosition: boolean;

  /**
   * Cooldown duration in milliseconds.
   * When moving from one popover to another within this duration,
   * the showDelay is skipped for the new popover.
   * @default 0
   */
  cooldown: number;
}

export const defaultPopoverConfig: NgpPopoverConfig = {
  offset: 4,
  placement: 'bottom',
  showDelay: 0,
  hideDelay: 0,
  flip: true,
  container: 'body',
  closeOnOutsideClick: true,
  closeOnEscape: true,
  scrollBehavior: 'reposition',
  shift: undefined,
  trackPosition: false,
  cooldown: 0,
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
