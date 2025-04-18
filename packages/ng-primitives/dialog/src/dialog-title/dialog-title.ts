import { Directive, input, OnDestroy } from '@angular/core';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectDialogState } from '../dialog/dialog-state';

@Directive({
  selector: '[ngpDialogTitle]',
  exportAs: 'ngpDialogTitle',
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogTitle implements OnDestroy {
  /** Access the dialog. */
  private readonly dialog = injectDialogState();

  /** The id of the title. */
  readonly id = input<string>(uniqueId('ngp-dialog-title'));

  constructor() {
    onChange(this.id, (id, prevId) => {
      if (prevId) {
        this.dialog().removeLabelledBy(prevId);
      }

      if (id) {
        this.dialog().setLabelledBy(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.dialog().removeLabelledBy(this.id());
  }
}
