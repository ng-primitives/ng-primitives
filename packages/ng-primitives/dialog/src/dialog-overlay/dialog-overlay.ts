import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, effect, HostListener, input } from '@angular/core';
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

  /**
   * Whether the dialog should close on escape key press.
   * @default `false`
   */
  readonly disableEscapeKey = input<boolean, BooleanInput>(false, {
    alias: 'ngpDialogOverlayDisableEscapeKey',
    transform: booleanAttribute,
  });

  disableEscapeKeyEffect = effect(() => {
    if (this.disableEscapeKey()) {
      this.dialogRef.disableEscapeKey = true;
    } else {
      this.dialogRef.disableEscapeKey = false;
    }
  });

  @HostListener('click')
  protected close(): void {
    if (this.closeOnClick()) {
      this.dialogRef.close();
    }
  }
}
