/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input, OnDestroy } from '@angular/core';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectDialog } from '../dialog/dialog-token';
import { NgpDialogTitleToken } from './dialog-title-token';

@Directive({
  selector: '[ngpDialogTitle]',
  exportAs: 'ngpDialogTitle',
  providers: [{ provide: NgpDialogTitleToken, useExisting: NgpDialogTitle }],
  host: {
    '[id]': 'id()',
  },
})
export class NgpDialogTitle implements OnDestroy {
  /** Access the dialog. */
  private readonly dialog = injectDialog();

  /** The id of the title. */
  readonly id = input<string>(uniqueId('ngp-dialog-title'));

  constructor() {
    onChange(this.id, (id, prevId) => {
      if (prevId) {
        this.dialog.removeLabelledBy(prevId);
      }

      if (id) {
        this.dialog.setLabelledBy(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.dialog.removeLabelledBy(this.id());
  }
}
