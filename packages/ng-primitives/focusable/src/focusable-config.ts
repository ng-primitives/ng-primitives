import { inject, InjectionToken, Provider } from '@angular/core';

export interface NgpFocusableConfig {
  /**
   * Whether to automatically manage the `aria-disabled` attribute.
   * @default true
   * @remarks
   * When `false`, the `aria-disabled` attribute will not be set automatically.
   */
  readonly autoManageAriaDisabled: boolean;

  /**
   * Whether to automatically manage the `tabindex` attribute.
   * @default true
   * @remarks
   * When `false`, the `tabindex` attribute will not be set automatically.
   */
  readonly autoManageTabIndex: boolean;
}

export const defaultFocusableConfig: NgpFocusableConfig = {
  autoManageAriaDisabled: true,
  autoManageTabIndex: true,
};

export const NgpFocusableConfigToken = new InjectionToken<NgpFocusableConfig>(
  'NgpFocusableConfigToken',
);

/**
 * Provide the default Focusable configuration
 * @param config The Focusable configuration
 * @returns The provider
 */
export function provideFocusableConfig(config: Partial<NgpFocusableConfig>): Provider[] {
  return [
    {
      provide: NgpFocusableConfigToken,
      useValue: { ...defaultFocusableConfig, ...config } satisfies NgpFocusableConfig,
    },
  ];
}

/**
 * Inject the Focusable configuration
 * @returns The global Focusable configuration
 */
export function injectFocusableConfig(): NgpFocusableConfig {
  return inject(NgpFocusableConfigToken, { optional: true }) ?? defaultFocusableConfig;
}
