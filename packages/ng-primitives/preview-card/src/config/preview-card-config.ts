import { InjectionToken, Provider, inject } from '@angular/core';
import { type Placement } from '@floating-ui/dom';
import { NgpFlip, NgpOffset, NgpShift } from 'ng-primitives/portal';

export interface NgpPreviewCardConfig {
  /**
   * Define the placement of the preview card relative to the trigger.
   * @default 'bottom'
   */
  placement: Placement;

  /**
   * Define the offset of the preview card relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  offset: NgpOffset;

  /**
   * Define the delay before the preview card is shown. This is deliberately long so
   * that cards do not appear while the pointer travels across a page full of links.
   * @default 600
   */
  showDelay: number;

  /**
   * Define the delay before the preview card is hidden.
   * @default 300
   */
  hideDelay: number;

  /**
   * Define whether the preview card should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  flip: NgpFlip;

  /**
   * Configure shift behavior to keep the preview card in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  shift: NgpShift;

  /**
   * Define the container element or selector into which the preview card should be attached.
   * @default 'body'
   */
  container: HTMLElement | string | null;

  /**
   * Defines how the preview card behaves when the window is scrolled.
   * @default 'reposition'
   */
  scrollBehavior: 'reposition' | 'close';

  /**
   * Cooldown duration in milliseconds.
   * When moving from one preview card to another within this duration,
   * the showDelay is skipped for the new card.
   * @default 300
   */
  cooldown: number;
}

export const defaultPreviewCardConfig: NgpPreviewCardConfig = {
  placement: 'bottom',
  offset: 4,
  showDelay: 600,
  hideDelay: 300,
  flip: true,
  shift: undefined,
  container: 'body',
  scrollBehavior: 'reposition',
  cooldown: 300,
};

export const NgpPreviewCardConfigToken = new InjectionToken<NgpPreviewCardConfig>(
  'NgpPreviewCardConfigToken',
);

/**
 * Provide the default PreviewCard configuration
 * @param config The PreviewCard configuration
 * @returns The provider
 */
export function providePreviewCardConfig(config: Partial<NgpPreviewCardConfig>): Provider[] {
  return [
    {
      provide: NgpPreviewCardConfigToken,
      useValue: { ...defaultPreviewCardConfig, ...config },
    },
  ];
}

/**
 * Inject the PreviewCard configuration
 * @returns The global PreviewCard configuration
 */
export function injectPreviewCardConfig(): NgpPreviewCardConfig {
  return inject(NgpPreviewCardConfigToken, { optional: true }) ?? defaultPreviewCardConfig;
}
