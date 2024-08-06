/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, contentChild, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpDialogTitleToken } from '../dialog-title/dialog-title.token';
import { NgpDialogToken } from './dialog.token';

@Directive({
  standalone: true,
  selector: '[ngpDialog]',
  exportAs: 'ngpDialog',
  providers: [{ provide: NgpDialogToken, useExisting: NgpDialog }],
  host: {
    role: 'dialog',
    '[id]': 'id()',
    '[attr.tabindex]': '-1',
    '[attr.data-open]': 'open()',
    '[attr.aria-labelledby]': 'title() ?? null',
  },
})
export class NgpDialog {
  /**
   * Define the id of the dialog.
   */
  readonly id = input(uniqueId('ngp-dialog'));

  /**
   * The open state of the dialog.
   */
  readonly open = input<boolean, BooleanInput>(false, {
    alias: 'ngpDialogOpen',
    transform: booleanAttribute,
  });

  /**
   * The type of the dialog.
   */
  readonly type = input<NgpDialogRole>('dialog', {
    alias: 'ngpDialogRole',
  });

  /**
   * Access the title of the dialog.
   */
  protected readonly title = contentChild(NgpDialogTitleToken, { descendants: true });
}

/**
 * The type of the dialog.
 */
export type NgpDialogRole = 'dialog' | 'alertdialog';
