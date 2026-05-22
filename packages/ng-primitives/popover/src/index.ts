export { injectOverlayContext as injectPopoverContext } from 'ng-primitives/portal';
export { NgpPopoverConfig, providePopoverConfig } from './config/popover-config';
export { NgpPopoverArrow } from './popover-arrow/popover-arrow';
export {
  injectPopoverArrowState,
  NgpPopoverArrowProps,
  NgpPopoverArrowState,
  NgpPopoverArrowStateToken,
  ngpPopoverArrow,
  providePopoverArrowState,
} from './popover-arrow/popover-arrow-state';
export { NgpPopoverTrigger } from './popover-trigger/popover-trigger';
export { NgpPopover } from './popover/popover';
export {
  type NgpPopoverProps,
  type NgpPopoverState,
  NgpPopoverStateToken,
  ngpPopover,
  injectPopoverState,
  providePopoverState,
} from './popover/popover-state';
export {
  NgpPopoverTriggerStateToken,
  ngpPopoverTrigger,
  injectPopoverTriggerState,
  providePopoverTriggerState,
  type NgpPopoverTriggerState,
  type NgpPopoverTriggerProps,
  type NgpPopoverPlacement,
} from './popover-trigger/popover-trigger-state';
