import { inject, InjectionToken, Provider } from '@angular/core';

export interface NgpButtonConfig {
  /**
   * When `true`, the host element's role attribute will be automatically set to `button` if
   * the host element is not a native button element nor a native anchor element with a valid href,
   * and no role attribute is already set.
   * @default false
   */
  autoSetRole: boolean;

  /**
   * When `true`, the host element's type attribute will be automatically set to `button` if the
   * host element is a native button element and no type attribute is already set.
   * @default false
   */
  autoSetType: boolean;
}

export const defaultButtonConfig: NgpButtonConfig = {
  autoSetRole: false,
  autoSetType: false,
};

export const NgpButtonConfigToken = new InjectionToken<NgpButtonConfig>('NgpButtonConfigToken');

/**
 * Provide the default Button configuration
 * @param config The Button configuration
 * @returns The provider
 */
export function provideButtonConfig(config: Partial<NgpButtonConfig>): Provider[] {
  return [
    {
      provide: NgpButtonConfigToken,
      useValue: { ...defaultButtonConfig, ...config } satisfies NgpButtonConfig,
    },
  ];
}

/**
 * Inject the Button configuration
 * @returns The global Button configuration
 */
export function injectButtonConfig(): NgpButtonConfig {
  return inject(NgpButtonConfigToken, { optional: true }) ?? defaultButtonConfig;
}
