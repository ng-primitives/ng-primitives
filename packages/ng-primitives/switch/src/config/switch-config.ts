import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpSwitchConfig {
  /**
   * Whether the Enter key toggles the switch. Space always toggles it.
   * @default true
   */
  toggleOnEnter: boolean;
}

export const defaultSwitchConfig: NgpSwitchConfig = {
  toggleOnEnter: true,
};

export const NgpSwitchConfigToken = new InjectionToken<NgpSwitchConfig>('NgpSwitchConfigToken');

/**
 * Provide the default Switch configuration
 * @param config The Switch configuration
 * @returns The provider
 */
export function provideSwitchConfig(config: Partial<NgpSwitchConfig>): Provider[] {
  return [
    {
      provide: NgpSwitchConfigToken,
      useValue: { ...defaultSwitchConfig, ...config },
    },
  ];
}

/**
 * Inject the Switch configuration
 * @returns The global Switch configuration
 */
export function injectSwitchConfig(): NgpSwitchConfig {
  return inject(NgpSwitchConfigToken, { optional: true }) ?? defaultSwitchConfig;
}
