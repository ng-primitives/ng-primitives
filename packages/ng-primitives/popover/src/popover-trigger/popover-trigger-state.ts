import { InjectOptions, Signal } from '@angular/core';
import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  State,
} from 'ng-primitives/state';
import type { NgpPopoverTrigger } from './popover-trigger';

/**
 * The state token  for the PopoverTrigger primitive.
 */
export const NgpPopoverTriggerStateToken = createStateToken<NgpPopoverTrigger>('PopoverTrigger');

/**
 * Provides the PopoverTrigger state.
 */
export const providePopoverTriggerState = createStateProvider(NgpPopoverTriggerStateToken);

/**
 * Injects the PopoverTrigger state.
 */
export const injectPopoverTriggerState = createStateInjector<NgpPopoverTrigger>(
  NgpPopoverTriggerStateToken,
) as <T>(options?: InjectOptions) => Signal<State<NgpPopoverTrigger<T>>>;

/**
 * The PopoverTrigger state registration function.
 */
export const popoverTriggerState = createState(NgpPopoverTriggerStateToken);
