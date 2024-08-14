/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener, input } from '@angular/core';
import { injectDialogConfig } from '../config/dialog.config';
import { injectDialogTrigger } from '../dialog-trigger/dialog-trigger.token';
import { NgpDialogOverlayToken } from './dialog-overlay.token';

@Directive({
  standalone: true,
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  providers: [{ provide: NgpDialogOverlayToken, useExisting: NgpDialogOverlay }],
})
export class NgpDialogOverlay {
  /** Access the dialog trigger. */
  private readonly trigger = injectDialogTrigger();

  /** Access the dialog config */
  private readonly config = injectDialogConfig();

  /** Whether the dialog should close on overlay click. */
  readonly closeOnClick = input(this.config.closeOnOverlayClick, {
    alias: 'ngpDialogOverlayCloseOnClick',
  });

  @HostListener('click')
  protected close(): void {
    if (this.closeOnClick()) {
      this.trigger.overlayRef?.dispose();
    }
  }
}
