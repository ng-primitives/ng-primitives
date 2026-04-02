import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { injectDialogRef } from '../dialog/dialog-ref';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  hostDirectives: [NgpExitAnimation],
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onClick($event)',
    '(pointercancel)': 'resetPointerOrigin()',
  },
})
export class NgpDialogOverlay {
  private readonly dialogRef = injectDialogRef();
  private startedPointerDownOnOverlay = false;

  /**
   * Whether the dialog should close on backdrop click.
   * @default `true`
   */
  readonly closeOnClick = input(this.dialogRef.config.closeOnClick, {
    alias: 'ngpDialogOverlayCloseOnClick',
    transform: booleanAttribute,
  });

  protected onPointerDown(event: Event): void {
    this.startedPointerDownOnOverlay = event.target === event.currentTarget;
  }

  protected onClick(event: Event): void {
    const shouldClose =
      this.startedPointerDownOnOverlay &&
      event.target === event.currentTarget &&
      this.closeOnClick() &&
      !this.dialogRef.disableClose;

    this.resetPointerOrigin();

    if (shouldClose) {
      this.dialogRef.close(undefined, 'mouse');
    }
  }

  protected resetPointerOrigin(): void {
    this.startedPointerDownOnOverlay = false;
  }
}
