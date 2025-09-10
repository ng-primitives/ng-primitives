import { booleanAttribute, Directive, HostListener, input } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { injectDialogConfig } from '../config/dialog-config';
import { injectDialogRef } from '../dialog/dialog-ref';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  hostDirectives: [NgpExitAnimation],
})
export class NgpDialogOverlay {
  /** Access the global configuration */
  private readonly config = injectDialogConfig();

  /** Access the dialog ref. */
  private readonly dialogRef = injectDialogRef();

  /**
   * Whether the dialog should close on backdrop click.
   * @default `true`
   */
  readonly closeOnClick = input(this.config.closeOnClick, {
    alias: 'ngpDialogOverlayCloseOnClick',
    transform: booleanAttribute,
  });

  @HostListener('click')
  protected close(): void {
    if (this.closeOnClick()) {
      this.dialogRef.close(undefined, 'mouse');
    }
  }
}
