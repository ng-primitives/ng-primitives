import { inject, InjectionToken, Provider } from '@angular/core';

export interface NgpPasswordConfig {
  /**
   * The accessible label for the toggle button when the password is hidden.
   * @default 'Show password'
   */
  showLabel: string;

  /**
   * The accessible label for the toggle button when the password is visible.
   * @default 'Hide password'
   */
  hideLabel: string;

  /**
   * The message announced to screen readers when the password becomes visible.
   * @default 'Your password is shown'
   */
  shownAnnouncement: string;

  /**
   * The message announced to screen readers when the password becomes hidden.
   * @default 'Your password is hidden'
   */
  hiddenAnnouncement: string;

  /**
   * Whether to opt the input out of password manager injection by default.
   * @default false
   */
  ignorePasswordManagers: boolean;
}

export const defaultPasswordConfig: NgpPasswordConfig = {
  showLabel: 'Show password',
  hideLabel: 'Hide password',
  shownAnnouncement: 'Your password is shown',
  hiddenAnnouncement: 'Your password is hidden',
  ignorePasswordManagers: false,
};

export const NgpPasswordConfigToken = new InjectionToken<NgpPasswordConfig>(
  'NgpPasswordConfigToken',
);

/**
 * Provide the default Password configuration
 * @param config The Password configuration
 * @returns The provider
 */
export function providePasswordConfig(config: Partial<NgpPasswordConfig>): Provider[] {
  return [
    {
      provide: NgpPasswordConfigToken,
      useValue: { ...defaultPasswordConfig, ...config },
    },
  ];
}

/**
 * Inject the Password configuration
 * @returns The global Password configuration
 */
export function injectPasswordConfig(): NgpPasswordConfig {
  return inject(NgpPasswordConfigToken, { optional: true }) ?? defaultPasswordConfig;
}
