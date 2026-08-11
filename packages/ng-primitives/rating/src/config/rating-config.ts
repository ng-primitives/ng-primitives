import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpRatingConfig {
  /**
   * The default number of items in the rating.
   */
  count: number;
  /**
   * Whether re-selecting the current value clears the rating to 0 (deselection).
   */
  clearable: boolean;
  /**
   * Produce the `aria-valuetext` announced to assistive technology. Override
   * for localisation.
   */
  valueText: (value: number, count: number) => string;
}

export const defaultRatingConfig: NgpRatingConfig = {
  count: 5,
  clearable: false,
  valueText: (value, count) => `${value} out of ${count}`,
};

export const NgpRatingConfigToken = new InjectionToken<NgpRatingConfig>('NgpRatingConfigToken');

/**
 * Provide the default Rating configuration
 * @param config The Rating configuration
 * @returns The provider
 */
export function provideRatingConfig(config: Partial<NgpRatingConfig>): Provider[] {
  return [
    {
      provide: NgpRatingConfigToken,
      useValue: { ...defaultRatingConfig, ...config },
    },
  ];
}

/**
 * Inject the Rating configuration
 * @returns The global Rating configuration
 */
export function injectRatingConfig(): NgpRatingConfig {
  return inject(NgpRatingConfigToken, { optional: true }) ?? defaultRatingConfig;
}
