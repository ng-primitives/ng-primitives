import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input } from '@angular/core';
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

  /**
   * Whether the dialog should close on backdrop click.
   * @default `true`
   */
  readonly closeOnClick = input<boolean, BooleanInput>(true, {
    alias: 'ngpDialogOverlayCloseOnClick',
    transform: booleanAttribute,
  });

  @HostListener('click')
  protected close(): void {
    if (this.closeOnClick()) {
      this.dialogRef.close();
    }
  }
}
