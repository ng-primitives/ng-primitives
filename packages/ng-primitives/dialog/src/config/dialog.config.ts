/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpDialogConfig {
  /**
   * The role of the dialog.
   */
  role: 'dialog' | 'alertdialog';
  /**
   * Whether the dialog is modal.
   */
  modal: boolean;
}

export const defaultDialogConfig: NgpDialogConfig = {
  role: 'dialog',
  modal: true,
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
