import { Directive, HostListener } from '@angular/core';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
import { injectDialogRef } from '../dialog/dialog-ref';

@Directive({
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  hostDirectives: [NgpExitAnimation],
})
export class NgpDialogOverlay {
  private readonly dialogRef = injectDialogRef();

  @HostListener('click', ['$event'])
  protected close(event: MouseEvent): void {
    if (this.dialogRef.disableClose) {
      return;
    }

    const guard: NgpDismissGuard<Element> | undefined = this.dialogRef.closeOnOutsideClick;
    const target = event.target as Element;

    if (guard === false) {
      return;
    }

    if (guard === true || guard === undefined) {
      this.dialogRef.close(undefined, 'mouse');
      return;
    }

    // Guard function — evaluate sync or async
    const result = guard(target);
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
}
