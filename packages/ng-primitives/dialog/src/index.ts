export { NgpDialogConfig, provideDialogConfig } from './config/dialog-config';
export { NgpDialogDescription } from './dialog-description/dialog-description';
export { NgpDialogOverlay } from './dialog-overlay/dialog-overlay';
export { NgpDialogTitle } from './dialog-title/dialog-title';
export { NgpDialogTrigger } from './dialog-trigger/dialog-trigger';
export { NgpDialog } from './dialog/dialog';
export { injectDialogRef, NgpDialogRef } from './dialog/dialog-ref';
export { injectDialogState, provideDialogState } from './dialog/dialog-state';
export { NgpDialogContext, NgpDialogManager } from './dialog/dialog.service';
export {
  NgpDialogDescriptionStateToken,
  ngpDialogDescription,
  injectDialogDescriptionState,
  provideDialogDescriptionState,
  type NgpDialogDescriptionState,
  type NgpDialogDescriptionProps,
} from './dialog-description/dialog-description-state';
