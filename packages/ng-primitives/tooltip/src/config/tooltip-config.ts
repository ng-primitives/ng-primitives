import { InjectionToken, Provider, inject } from '@angular/core';
import { type Placement } from '@floating-ui/dom';

export interface NgpTooltipConfig {
  /**
   * Define the offset of the tooltip relative to the trigger.
   * @default 4
   */
  offset: number;

  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  placement: Placement;

  /**
   * Define the delay before the tooltip is shown.
   * @default 0
   */
  showDelay: number;

  /**
   * Define the delay before the tooltip is hidden.
   * @default 500
   */
  hideDelay: number;

  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * @default true
   */
  flip: boolean;

  /**
   * Define the container in to which the tooltip should be attached.
   * @default document.body
   */
  container: HTMLElement | null;

  /**
   * Whether the tooltip should only show when the trigger element overflows.
   * @default false
   */
  showOnOverflow: boolean;
}

export const defaultTooltipConfig: NgpTooltipConfig = {
  offset: 4,
  placement: 'top',
  showDelay: 0,
  hideDelay: 500,
  flip: true,
  container: null,
  showOnOverflow: false,
};

export const NgpTooltipConfigToken = new InjectionToken<NgpTooltipConfig>('NgpTooltipConfigToken');

/**
 * Provide the default Tooltip configuration
 * @param config The Tooltip configuration
 * @returns The provider
 */
export function provideTooltipConfig(config: Partial<NgpTooltipConfig>): Provider[] {
  return [
    {
      provide: NgpTooltipConfigToken,
      useValue: { ...defaultTooltipConfig, ...config },
    },
  ];
}

/**
 * Inject the Tooltip configuration
 * @returns The global Tooltip configuration
 */
export function injectTooltipConfig(): NgpTooltipConfig {
  return inject(NgpTooltipConfigToken, { optional: true }) ?? defaultTooltipConfig;
}
