/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  input,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { uniqueId } from 'ng-primitives/utils';
import { injectDialogConfig } from '../config/dialog.config';
import { NgpDialogDescriptionToken } from '../dialog-description/dialog-description.token';
import { NgpDialogTitleToken } from '../dialog-title/dialog-title.token';
import { injectDialogTrigger } from '../dialog-trigger/dialog-trigger.token';
import { NgpDialogToken } from './dialog.token';

@Directive({
  standalone: true,
  selector: '[ngpDialog]',
  exportAs: 'ngpDialog',
  providers: [{ provide: NgpDialogToken, useExisting: NgpDialog }],
  hostDirectives: [NgpFocusTrap],
  host: {
    tabindex: '-1',
    '[id]': 'id()',
    '[attr.role]': 'role()',
    '[attr.aria-modal]': 'modal()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[attr.aria-describedby]': 'describedBy()',
  },
})
export class NgpDialog implements OnDestroy {
  private readonly config = injectDialogConfig();

  /** Access the dialog trigger. */
  private readonly trigger = injectDialogTrigger();

  /** Store the stack of dialogs. */
  private static stack: NgpDialog[] = [];

  /** The id of the dialog */
  readonly id = input<string>(uniqueId('ngp-dialog'));

  /** The dialog role. */
  readonly role = input(this.config.role, {
    alias: 'ngpDialogRole',
  });

  /** Whether the dialog is a modal. */
  readonly modal = input<boolean, BooleanInput>(this.config.modal, {
    alias: 'ngpDialogModal',
    transform: booleanAttribute,
  });

  /** The dialog title(s). */
  readonly titles = contentChildren(NgpDialogTitleToken, { descendants: true });

  /** The dialog description(s). */
  readonly descriptions = contentChildren(NgpDialogDescriptionToken, { descendants: true });

  /** The labelledby ids */
  protected readonly labelledBy = computed(() =>
    this.titles()
      .map(title => title.id())
      .join(' '),
  );

  /** The describedby ids */
  protected readonly describedBy = computed(() =>
    this.descriptions()
      .map(description => description.id())
      .join(' '),
  );

  constructor() {
    NgpDialog.stack.push(this);

    // Close the dialog when the escape key is pressed and this is the top-most dialog.
    this.trigger.overlayRef
      ?.keydownEvents()
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        if (event.key === 'Escape' && NgpDialog.stack[NgpDialog.stack.length - 1] === this) {
          this.trigger.overlayRef?.dispose();
        }
      });
  }

  ngOnDestroy(): void {
    NgpDialog.stack.pop();
  }
}
