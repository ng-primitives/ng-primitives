/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener } from '@angular/core';
import { injectDialogRef } from '../dialog/dialog-ref';
import { NgpDialogOverlayToken } from './dialog-overlay.token';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  providers: [{ provide: NgpDialogOverlayToken, useExisting: NgpDialogOverlay }],
})
export class NgpDialogOverlay {
  /** Access the dialog ref. */
  private readonly dialogRef = injectDialogRef();

  @HostListener('click')
  protected close(): void {
    this.dialogRef.close();
  }
}
