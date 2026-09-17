import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpAiConfig {
  /**
   * The BCP 47 language tag dictation transcribes in, e.g. `en-US` or `es-ES`.
   * When undefined the page's own language is used: the document's `lang` attribute,
   * falling back to the browser's language.
   * @default undefined
   */
  dictationLanguage: string | undefined;
}

export const defaultAiConfig: NgpAiConfig = {
  dictationLanguage: undefined,
};

export const NgpAiConfigToken = new InjectionToken<NgpAiConfig>('NgpAiConfigToken');

/**
 * Provide the default Ai configuration
 * @param config The Ai configuration
 * @returns The provider
 */
export function provideAiConfig(config: Partial<NgpAiConfig>): Provider[] {
  return [
    {
      provide: NgpAiConfigToken,
      useValue: { ...defaultAiConfig, ...config },
    },
  ];
}

/**
 * Inject the Ai configuration
 * @returns The global Ai configuration
 */
export function injectAiConfig(): NgpAiConfig {
  return inject(NgpAiConfigToken, { optional: true }) ?? defaultAiConfig;
}
