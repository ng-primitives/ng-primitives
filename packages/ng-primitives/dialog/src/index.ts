/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export { NgpDialogConfig, provideDialogConfig } from './config/dialog.config';
export { NgpDialogDescription } from './dialog-description/dialog-description.directive';
export {
  NgpDialogDescriptionToken,
  injectDialogDescription,
} from './dialog-description/dialog-description.token';
export { NgpDialogOverlay } from './dialog-overlay/dialog-overlay.directive';
export { NgpDialogOverlayToken, injectDialogOverlay } from './dialog-overlay/dialog-overlay.token';
export { NgpDialogTitle } from './dialog-title/dialog-title.directive';
export { NgpDialogTitleToken, injectDialogTitle } from './dialog-title/dialog-title.token';
export { NgpDialogTrigger } from './dialog-trigger/dialog-trigger.directive';
export { NgpDialogTriggerToken, injectDialogTrigger } from './dialog-trigger/dialog-trigger.token';
export { injectDialogRef } from './dialog/dialog-ref';
export { NgpDialog } from './dialog/dialog.directive';
export { NgpDialogManager } from './dialog/dialog.service';
export { NgpDialogToken, injectDialog } from './dialog/dialog.token';
