import { Directive, HostListener } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { injectDialogRef } from '../dialog/dialog-ref';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
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
