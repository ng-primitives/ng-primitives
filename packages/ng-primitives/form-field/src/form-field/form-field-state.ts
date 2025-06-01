import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpFormField } from './form-field';

/**
 * The state token  for the FormField primitive.
 */
export const NgpFormFieldStateToken = createStateToken<NgpFormField>('FormField');

/**
 * Provides the FormField state.
 */
export const provideFormFieldState = createStateProvider(NgpFormFieldStateToken);

/**
 * Injects the FormField state.
 */
export const injectFormFieldState = createStateInjector<NgpFormField>(NgpFormFieldStateToken);

/**
 * The FormField state registration function.
 */
export const formFieldState = createState(NgpFormFieldStateToken);
