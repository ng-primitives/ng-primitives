import { Signal } from '@angular/core';
import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  State,
} from 'ng-primitives/state';
import type { NgpTooltipTrigger } from './tooltip-trigger';

/**
 * The state token  for the TooltipTrigger primitive.
 */
export const NgpTooltipTriggerStateToken =
  createStateToken<NgpTooltipTrigger<unknown>>('TooltipTrigger');

/**
 * Provides the TooltipTrigger state.
 */
export const provideTooltipTriggerState = createStateProvider(NgpTooltipTriggerStateToken);

/**
 * Injects the TooltipTrigger state.
 */
export const injectTooltipTriggerState = createStateInjector(NgpTooltipTriggerStateToken) as <
  T,
>() => Signal<State<NgpTooltipTrigger<T>>>;

/**
 * The TooltipTrigger state registration function.
 */
export const tooltipTriggerState = createState(NgpTooltipTriggerStateToken);
