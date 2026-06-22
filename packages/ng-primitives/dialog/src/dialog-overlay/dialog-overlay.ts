import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { injectDialogRef } from '../dialog/dialog-ref';
import { ngpDialogOverlay } from './dialog-overlay-state';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  hostDirectives: [NgpExitAnimation],
})
export class NgpDialogOverlay {
  protected readonly dialogRef = injectDialogRef();

  /**
   * Whether the dialog should close on backdrop click.
   * @default `true`
   */
  readonly closeOnClick = input(this.dialogRef.config.closeOnClick, {
    alias: 'ngpDialogOverlayCloseOnClick',
    transform: booleanAttribute,
  });

  protected readonly state = ngpDialogOverlay({
    closeOnClick: this.closeOnClick,
  });
}
