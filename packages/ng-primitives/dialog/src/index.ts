export { NgpDialogConfig, provideDialogConfig } from './config/dialog-config';
export { NgpDialogDescription } from './dialog-description/dialog-description';
export { NgpDialogOverlay } from './dialog-overlay/dialog-overlay';
export { NgpDialogTitle } from './dialog-title/dialog-title';
export { NgpDialogTrigger } from './dialog-trigger/dialog-trigger';
export { NgpDialog } from './dialog/dialog';
export { injectDialogRef, NgpDialogRef } from './dialog/dialog-ref';
export { NgpDialogContext, NgpDialogManager } from './dialog/dialog.service';
export {
  NgpDialogDescriptionStateToken,
  ngpDialogDescription,
  injectDialogDescriptionState,
  provideDialogDescriptionState,
  type NgpDialogDescriptionState,
  type NgpDialogDescriptionProps,
} from './dialog-description/dialog-description-state';
export {
  NgpDialogOverlayStateToken,
  ngpDialogOverlay,
  injectDialogOverlayState,
  provideDialogOverlayState,
  type NgpDialogOverlayState,
  type NgpDialogOverlayProps,
} from './dialog-overlay/dialog-overlay-state';
export {
  NgpDialogPanelStateToken,
  ngpDialogPanel,
  injectDialogPanelState,
  provideDialogPanelState,
  type NgpDialogPanelState,
  type NgpDialogPanelProps,
} from './dialog-panel/dialog-panel-state';
export {
  NgpDialogTitleStateToken,
  ngpDialogTitle,
  injectDialogTitleState,
  provideDialogTitleState,
  type NgpDialogTitleState,
  type NgpDialogTitleProps,
} from './dialog-title/dialog-title-state';
export {
  NgpDialogTriggerStateToken,
  ngpDialogTrigger,
  injectDialogTriggerState,
  provideDialogTriggerState,
  type NgpDialogTriggerState,
  type NgpDialogTriggerProps,
} from './dialog-trigger/dialog-trigger-state';
export {
  NgpDialogStateToken,
  ngpDialog,
  injectDialogState,
  provideDialogState,
  type NgpDialogState,
  type NgpDialogProps,
} from './dialog/dialog-state';
