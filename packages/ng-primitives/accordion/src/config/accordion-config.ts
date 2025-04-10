import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpAccordionType } from '../accordion/accordion';

export interface NgpAccordionConfig {
  /**
   * The default type of the accordion
   * @default 'single'
   */
  type: NgpAccordionType;
  /**
   * Whether the accordion is collapsible
   * @default false
   */
  collapsible: boolean;
  /**
   * The default orientation of the accordion
   * @default 'vertical'
   */
  orientation: 'vertical' | 'horizontal';
}

export const defaultAccordionConfig: NgpAccordionConfig = {
  type: 'single',
  collapsible: false,
  orientation: 'vertical',
};

export const NgpAccordionConfigToken = new InjectionToken<NgpAccordionConfig>(
  'NgpAccordionConfigToken',
);

/**
 * Provide the default Accordion configuration
 * @param config The Accordion configuration
 * @returns The provider
 */
export function provideAccordionConfig(config: Partial<NgpAccordionConfig>): Provider[] {
  return [
    {
      provide: NgpAccordionConfigToken,
      useValue: { ...defaultAccordionConfig, ...config },
    },
  ];
}

/**
 * Inject the Accordion configuration
 * @returns The global Accordion configuration
 */
export function injectAccordionConfig(): NgpAccordionConfig {
  return inject(NgpAccordionConfigToken, { optional: true }) ?? defaultAccordionConfig;
}
