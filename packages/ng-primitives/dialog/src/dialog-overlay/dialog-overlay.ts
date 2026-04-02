import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
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
    const isOverlayClick = this.startedPointerDownOnOverlay && event.target === event.currentTarget;

    this.resetPointerOrigin();

    if (!isOverlayClick || this.dialogRef.disableClose) {
      return;
    }

    const guard: NgpDismissGuard<Element> =
      this.dialogRef.closeOnOutsideClick ?? this.closeOnClick() ?? true;
    this.evaluateGuard(guard, event.target as Element);
  }

  private evaluateGuard(guard: NgpDismissGuard<Element>, target: Element): void {
    if (guard === true) {
      this.dialogRef.close(undefined, 'mouse');
      return;
    }

    if (guard === false) {
      return;
    }

    // Function guard — evaluate sync or async
    let result: boolean | Promise<boolean>;
    try {
      result = guard(target);
    } catch (error) {
      console.error('NgpDialogOverlay: dismiss guard threw', error);
      return;
    }

    if (typeof result === 'boolean') {
      if (result) {
        this.dialogRef.close(undefined, 'mouse');
      }
    } else {
      result
        .then(shouldClose => {
          if (shouldClose) {
            this.dialogRef.close(undefined, 'mouse');
          }
        })
        .catch(error => {
          console.error('NgpDialogOverlay: dismiss guard rejected', error);
        });
    }
  }

  protected resetPointerOrigin(): void {
    this.startedPointerDownOnOverlay = false;
  }
}
