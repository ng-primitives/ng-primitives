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
export const NgpTooltipTriggerStateToken = createStateToken<NgpTooltipTrigger>('TooltipTrigger');

/**
 * Provides the TooltipTrigger state.
 */
export const provideTooltipTriggerState = createStateProvider(NgpTooltipTriggerStateToken);

/**
 * Injects the TooltipTrigger state.
 */
export const injectTooltipTriggerState = createStateInjector(
  NgpTooltipTriggerStateToken,
) as () => Signal<State<NgpTooltipTrigger>>;

/**
 * The TooltipTrigger state registration function.
 */
export const tooltipTriggerState = createState(NgpTooltipTriggerStateToken);
