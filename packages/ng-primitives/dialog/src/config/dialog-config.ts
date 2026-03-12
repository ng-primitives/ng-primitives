import { InjectionToken, Injector, Provider, ViewContainerRef, inject } from '@angular/core';
import { NgpDismissGuard } from 'ng-primitives/portal';

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

  /**
   * Whether the dialog should close when the user navigates. This includes both browser history
   * navigation (back/forward) and programmatic route changes (e.g. router.navigate()).
   */
  closeOnNavigation?: boolean;

  /** Whether the dialog should close when the user presses the escape key, or a guard function. */
  closeOnEscape?: NgpDismissGuard<KeyboardEvent>;

  /** Whether the dialog should close when clicking outside (on the overlay), or a guard function. */
  closeOnOutsideClick?: NgpDismissGuard<Element>;

  /**
   * Whether the dialog should close when the user click the overlay.
   * @deprecated Use `closeOnOutsideClick` instead.
   */
  closeOnClick?: boolean;

  data?: T;
}

export const defaultDialogConfig: NgpDialogConfig = {
  role: 'dialog',
  modal: true,
  closeOnNavigation: true,
  closeOnEscape: true,
  closeOnClick: true,
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
