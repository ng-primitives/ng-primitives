import { Directive, input, OnDestroy } from '@angular/core';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectDialog } from '../dialog/dialog-token';
import { NgpDialogDescriptionToken } from './dialog-description-token';

@Directive({
  selector: '[ngpDialogDescription]',
  exportAs: 'ngpDialogDescription',
  providers: [{ provide: NgpDialogDescriptionToken, useExisting: NgpDialogDescription }],
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogDescription implements OnDestroy {
  /** Access the dialog */
  private readonly dialog = injectDialog();

  /** The id of the descriptions. */
  readonly id = input<string>(uniqueId('ngp-dialog-description'));

  constructor() {
    onChange(this.id, (id, prevId) => {
      if (prevId) {
        this.dialog.removeDescribedBy(prevId);
      }

      if (id) {
        this.dialog.setDescribedBy(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.dialog.removeDescribedBy(this.id());
  }
}
