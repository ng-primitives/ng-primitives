import { inject, InjectionToken, Provider } from '@angular/core';
import { defaultFocusableConfig } from 'ng-primitives/focusable';

export interface NgpButtonConfig {
  /**
   * Whether to automatically set the `role` attribute to `button`
   * if the element is not a native button element and the role attribute is not present.
   * @default false
   * @remarks
   * When `true`, the `role` attribute will be set to `button`.
   */
  readonly autoSetButtonRole: boolean;

  /**
   * Whether to automatically set the `type` attribute to `button`
   * if the element is a native button element and the type attribute is not present.
   * @default false
   * @remarks
   * When `true`, the `type` attribute will be set to `button`.
   * Native `<button>` elements default to `type="submit"` per the HTML spec,
   * which can cause unintended form submissions. Setting `type="button"` prevents this.
   */
  readonly autoSetButtonType: boolean;

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

export const defaultButtonConfig: NgpButtonConfig = {
  autoSetButtonRole: false,
  autoSetButtonType: false,
  autoManageAriaDisabled: defaultFocusableConfig.autoManageAriaDisabled,
  autoManageTabIndex: defaultFocusableConfig.autoManageTabIndex,
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
