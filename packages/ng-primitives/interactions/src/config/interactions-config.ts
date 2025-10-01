import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpInteractionsConfig {
  /** Whether all interactions are disabled */
  disabled?: boolean;
  /** Whether hover interactions are enabled */
  hover?: boolean;
  /** Whether focus interactions are enabled */
  focus?: boolean;
  /** Whether focus-visible interactions are enabled */
  focusVisible?: boolean;
  /** Whether press interactions are enabled */
  press?: boolean;
}

export const defaultInteractionsConfig: NgpInteractionsConfig = {
  disabled: false,
  hover: true,
  focus: true,
  focusVisible: true,
  press: true,
};

export const NgpInteractionsConfigToken = new InjectionToken<NgpInteractionsConfig>(
  'NgpInteractionsConfigToken',
);

/**
 * Provide the default Interactions configuration
 * @param config The Interactions configuration
 * @returns The provider
 */
export function provideInteractionsConfig(config: Partial<NgpInteractionsConfig>): Provider[] {
  return [
    {
      provide: NgpInteractionsConfigToken,
      useValue: { ...defaultInteractionsConfig, ...config },
    },
  ];
}

/**
 * Inject the Interactions configuration
 * @returns The global Interactions configuration
 */
export function injectInteractionsConfig(): NgpInteractionsConfig {
  return inject(NgpInteractionsConfigToken, { optional: true }) ?? defaultInteractionsConfig;
}

export function isHoverEnabled(): boolean {
  const config = injectInteractionsConfig();
  return !config.disabled && !!config.hover;
}

export function isFocusEnabled(): boolean {
  const config = injectInteractionsConfig();
  return !config.disabled && !!config.focus;
}

export function isFocusVisibleEnabled(): boolean {
  const config = injectInteractionsConfig();
  return !config.disabled && !!config.focusVisible;
}

export function isPressEnabled(): boolean {
  const config = injectInteractionsConfig();
  return !config.disabled && !!config.press;
}
