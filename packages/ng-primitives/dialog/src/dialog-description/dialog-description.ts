import { Directive, input, OnDestroy } from '@angular/core';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectDialogState } from '../dialog/dialog-state';

@Directive({
  selector: '[ngpDialogDescription]',
  exportAs: 'ngpDialogDescription',
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogDescription implements OnDestroy {
  /** Access the dialog */
  private readonly dialog = injectDialogState();

  /** The id of the descriptions. */
  readonly id = input<string>(uniqueId('ngp-dialog-description'));

  constructor() {
    onChange(this.id, (id, prevId) => {
      if (prevId) {
        this.dialog().removeDescribedBy(prevId);
      }

      if (id) {
        this.dialog().setDescribedBy(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.dialog().removeDescribedBy(this.id());
  }
}
