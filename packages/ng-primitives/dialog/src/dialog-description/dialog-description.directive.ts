/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input, OnDestroy } from '@angular/core';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectDialog } from '../dialog/dialog.token';
import { NgpDialogDescriptionToken } from './dialog-description.token';

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
