import { Signal } from '@angular/core';
import { syncState } from 'ng-primitives/internal';
import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpFormControl } from './form-control';

/**
 * The state token  for the FormControl primitive.
 */
export const NgpFormControlStateToken = createStateToken<NgpFormControl>('FormControl');

/**
 * Provides the FormControl state.
 */
export const provideFormControlState = createStateProvider(NgpFormControlStateToken);

/**
 * Injects the FormControl state.
 */
export const injectFormControlState = createStateInjector(NgpFormControlStateToken);

/**
 * The FormControl state registration function.
 */
export const formControlState = createState(NgpFormControlStateToken);

interface SyncFormControl {
  disabled: Signal<boolean>;
}

/**
 * Sync the form control state with control state.
 * @param disabled The disabled state of the control.
 */
export function syncFormControl({ disabled }: SyncFormControl) {
  const formControl = injectFormControlState();
  syncState(disabled, formControl().disabled);
}
