import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpFlip, NgpOffset, NgpShift } from 'ng-primitives/portal';

export interface NgpContextMenuConfig {
  /**
   * Define the offset of the context menu relative to the cursor position.
   * @default 2
   */
  offset: NgpOffset;

  /**
   * Define whether the context menu should flip when there is not enough space.
   * @default true
   */
  flip: NgpFlip;

  /**
   * Define the container element or selector in which the context menu should be attached.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Defines how the context menu behaves when the window is scrolled.
   * @default 'close'
   */
  scrollBehavior: 'reposition' | 'block' | 'close';

  /**
   * Configure shift behavior to keep the context menu in view.
   * @default undefined
   */
  shift: NgpShift;
}

export const defaultContextMenuConfig: NgpContextMenuConfig = {
  offset: 2,
  flip: true,
  container: 'body',
  scrollBehavior: 'close',
  shift: undefined,
};

export const NgpContextMenuConfigToken = new InjectionToken<NgpContextMenuConfig>(
  'NgpContextMenuConfigToken',
);

/**
 * Provide the default Context Menu configuration
 * @param config The Context Menu configuration
 * @returns The provider
 */
export function provideContextMenuConfig(config: Partial<NgpContextMenuConfig>): Provider[] {
  return [
    {
      provide: NgpContextMenuConfigToken,
      useValue: { ...defaultContextMenuConfig, ...config },
    },
  ];
}

/**
 * Inject the Context Menu configuration
 * @returns The global Context Menu configuration
 */
export function injectContextMenuConfig(): NgpContextMenuConfig {
  return inject(NgpContextMenuConfigToken, { optional: true }) ?? defaultContextMenuConfig;
}
