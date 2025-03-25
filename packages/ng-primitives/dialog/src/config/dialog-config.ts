/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken, Injector, Provider, ViewContainerRef, inject } from '@angular/core';

/** Valid ARIA roles for a dialog. */
export type NgpDialogRole = 'dialog' | 'alertdialog';

export interface NgpDialogConfig<T = any> {
  /** The view container to attach the dialog to. */
  viewContainerRef?: ViewContainerRef;

  /** The injector to use for the dialog. Defaults to the view container's injector.*/
  injector?: Injector;

  /** ID for the dialog. If omitted, a unique one will be generated. */
  id?: string;

  /** The role of the dialog. */
  role?: NgpDialogRole;

  /** Whether this is a modal dialog. Used to set the `aria-modal` attribute. */
  modal?: boolean;

  /** Scroll strategy to be used for the dialog. This determines how the dialog responds to scrolling underneath the panel element. */
  scrollStrategy?: ScrollStrategy;

  /**
   * Whether the dialog should close when the user navigates backwards or forwards through browser
   * history.
   */
  closeOnNavigation?: boolean;

  data?: T;
}

export const defaultDialogConfig: NgpDialogConfig = {
  role: 'dialog',
  modal: true,
  closeOnNavigation: true,
};

export const NgpDialogConfigToken = new InjectionToken<NgpDialogConfig>('NgpDialogConfigToken');

/**
 * Provide the default Dialog configuration
 * @param config The Dialog configuration
 * @returns The provider
 */
export function provideDialogConfig(config: Partial<NgpDialogConfig>): Provider[] {
  return [
    {
      provide: NgpDialogConfigToken,
      useValue: { ...defaultDialogConfig, ...config },
    },
  ];
}

/**
 * Inject the Dialog configuration
 * @returns The global Dialog configuration
 */
export function injectDialogConfig(): NgpDialogConfig {
  return inject(NgpDialogConfigToken, { optional: true }) ?? defaultDialogConfig;
}
