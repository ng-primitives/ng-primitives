import { Directive, HostListener } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { injectDialogRef } from '../dialog/dialog-ref';
import { NgpDialogOverlayToken } from './dialog-overlay-token';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  providers: [{ provide: NgpDialogOverlayToken, useExisting: NgpDialogOverlay }],
  hostDirectives: [NgpExitAnimation],
})
export class NgpDialogOverlay {
  /** Access the dialog ref. */
  private readonly dialogRef = injectDialogRef();

  @HostListener('click')
  protected close(): void {
    this.dialogRef.close();
  }
}
