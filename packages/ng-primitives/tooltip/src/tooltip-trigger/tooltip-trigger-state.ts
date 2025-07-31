import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
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
export const injectTooltipTriggerState = createStateInjector<NgpTooltipTrigger<unknown>>(
  NgpTooltipTriggerStateToken,
);

/**
 * The TooltipTrigger state registration function.
 */
export const tooltipTriggerState = createState(NgpTooltipTriggerStateToken);
