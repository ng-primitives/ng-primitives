import { InjectionToken, Provider, inject } from '@angular/core';

// import { NgpToastGravity, NgpToastPosition } from '../toast/toast-ref';

export interface NgpToastConfig {
  /**
   * The duration of each toast.
   */
  duration: number;

  /**
   * The width of each toast in pixels.
   */
  width: number;

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

  // /**
  //  * The gravity of each toast.
  //  */
  // gravity: NgpToastGravity;

  // /**
  //  * The position of each toast.
  //  */
  // position: NgpToastPosition;

  /**
   * The aria live setting.
   */
  ariaLive: string;

  /**
   * The gap between each toast.
   */
  gap: number;
}

export const defaultToastConfig: NgpToastConfig = {
  gap: 16,
  duration: 3000,
  width: 360,
  offsetTop: 24,
  offsetBottom: 24,
  offsetLeft: 24,
  offsetRight: 24,
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
