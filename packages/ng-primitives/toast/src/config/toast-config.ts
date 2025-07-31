import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpToastPlacement, NgpToastSwipeDirection } from '../toast/toast';

export interface NgpToastConfig {
  /**
   * The position of the toast.
   */
  placement: NgpToastPlacement;

  /**
   * The duration of each toast.
   */
  duration: number;

  /**
   * The width of each toast in pixels.
   * If not provided, the toast will be responsive based on viewport width.
   */
  width?: number;

  /**
   * The offset from the top of the viewport in pixels.
   */
  offsetTop: number;

  /**
   * The offset from the bottom of the viewport in pixels.
   */
  offsetBottom: number;

  /**
   * The offset from the left of the viewport in pixels.
   */
  offsetLeft: number;

  /**
   * The offset from the right of the viewport in pixels.
   */
  offsetRight: number;

  /**
   * Whether a toast can be dismissed by swiping.
   */
  dismissible: boolean;

  /**
   * The amount a toast must be swiped before it is considered dismissed.
   */
  swipeThreshold: number;

  /**
   * The default swipe directions supported by the toast.
   */
  swipeDirections: NgpToastSwipeDirection[];

  /**
   * The maximum number of toasts that can be displayed at once.
   */
  maxToasts: number;

  /**
   * The aria live setting.
   */
  ariaLive: string;

  /**
   * The gap between each toast.
   */
  gap: number;

  /**
   * The z-index of the toast container.
   * This is used to ensure that the toast container is always on top of other elements.
   */
  zIndex: number;
}

export const defaultToastConfig: NgpToastConfig = {
  gap: 14,
  duration: 3000,
  width: 360,
  placement: 'top-end',
  offsetTop: 24,
  offsetBottom: 24,
  offsetLeft: 24,
  offsetRight: 24,
  swipeThreshold: 45,
  swipeDirections: ['left', 'right', 'top', 'bottom'],
  dismissible: true,
  maxToasts: 3,
  zIndex: 9999999,
  ariaLive: 'polite',
};

export const NgpToastConfigToken = new InjectionToken<NgpToastConfig>('NgpToastConfigToken');

/**
 * Provide the default Toast configuration
 * @param config The Toast configuration
 * @returns The provider
 */
export function provideToastConfig(config: Partial<NgpToastConfig>): Provider[] {
  return [
    {
      provide: NgpToastConfigToken,
      useValue: { ...defaultToastConfig, ...config },
    },
  ];
}

/**
 * Inject the Toast configuration
 * @returns The global Toast configuration
 */
export function injectToastConfig(): NgpToastConfig {
  return inject(NgpToastConfigToken, { optional: true }) ?? defaultToastConfig;
}
