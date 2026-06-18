export { injectOverlayContext as injectTooltipContext } from 'ng-primitives/portal';
export { NgpTooltipConfig, provideTooltipConfig } from './config/tooltip-config';
export { NgpTooltipArrow } from './tooltip-arrow/tooltip-arrow';
export {
  injectTooltipArrowState,
  NgpTooltipArrowProps,
  NgpTooltipArrowState,
  NgpTooltipArrowStateToken,
  ngpTooltipArrow,
  provideTooltipArrowState,
} from './tooltip-arrow/tooltip-arrow-state';
export { NgpTooltipTrigger } from './tooltip-trigger/tooltip-trigger';
export { NgpTooltip } from './tooltip/tooltip';
export {
  NgpTooltipStateToken,
  ngpTooltip,
  injectTooltipState,
  provideTooltipState,
  type NgpTooltipState,
  type NgpTooltipProps,
} from './tooltip/tooltip-state';
export {
  NgpTooltipTextContentStateToken,
  ngpTooltipTextContent,
  injectTooltipTextContentState,
  provideTooltipTextContentState,
  type NgpTooltipTextContentState,
  type NgpTooltipTextContentProps,
} from './tooltip-text-content/tooltip-text-content-state';
export {
  NgpTooltipTriggerStateToken,
  ngpTooltipTrigger,
  injectTooltipTriggerState,
  provideTooltipTriggerState,
  type NgpTooltipTriggerState,
  type NgpTooltipTriggerProps,
  type NgpTooltipPlacement,
} from './tooltip-trigger/tooltip-trigger-state';
