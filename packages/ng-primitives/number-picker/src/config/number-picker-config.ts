import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpNumberPickerConfig {
  /**
   * The default step value for the number picker.
   * @default 1
   */
  step: number;

  /**
   * The default minimum value for the number picker.
   * @default -Infinity
   */
  min: number;

  /**
   * The default maximum value for the number picker.
   * @default Infinity
   */
  max: number;
  /**
   * The default small step value for the number picker.
   * @default 0.1
   */
  smallStep: number;
  /**
   * The default large step value for the number picker.
   * @default 10
   */
  largeStep: number;
  /**
   * Whether the user can use the mouse wheel to change the value.
   * @default true
   */
  allowWheelScrub: boolean;

  /**
   * The format of the number picker.
   */
  format?: Intl.NumberFormatOptions;
}

export const defaultNumberPickerConfig: NgpNumberPickerConfig = {
  step: 1,
  min: -Infinity,
  max: Infinity,
  smallStep: 0.1,
  largeStep: 10,
  allowWheelScrub: true,
};

export const NgpNumberPickerConfigToken = new InjectionToken<NgpNumberPickerConfig>(
  'NgpNumberPickerConfigToken',
);

/**
 * Provide the default NumberPicker configuration
 * @param config The NumberPicker configuration
 * @returns The provider
 */
export function provideNumberPickerConfig(config: Partial<NgpNumberPickerConfig>): Provider[] {
  return [
    {
      provide: NgpNumberPickerConfigToken,
      useValue: { ...defaultNumberPickerConfig, ...config },
    },
  ];
}

/**
 * Inject the NumberPicker configuration
 * @returns The global NumberPicker configuration
 */
export function injectNumberPickerConfig(): NgpNumberPickerConfig {
  return inject(NgpNumberPickerConfigToken, { optional: true }) ?? defaultNumberPickerConfig;
}
