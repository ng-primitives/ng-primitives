/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input, OnDestroy, signal } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { uniqueId } from 'ng-primitives/utils';
import { injectDialogConfig } from '../config/dialog-config';
import { injectDialogRef } from './dialog-ref';
import { NgpDialogToken } from './dialog-token';

@Directive({
  selector: '[ngpDialog]',
  exportAs: 'ngpDialog',
  providers: [{ provide: NgpDialogToken, useExisting: NgpDialog }],
  hostDirectives: [NgpFocusTrap],
  host: {
    tabindex: '-1',
    '[id]': 'id()',
    '[attr.role]': 'role()',
    '[attr.aria-modal]': 'modal()',
    '[attr.aria-labelledby]': 'labelledBy().join(" ")',
    '[attr.aria-describedby]': 'describedBy().join(" ")',
  },
})
export class NgpDialog<T = unknown> implements OnDestroy {
  private readonly config = injectDialogConfig();

  /** Access the dialog ref */
  private readonly dialogRef = injectDialogRef<T>();

  /** The id of the dialog */
  readonly id = input<string>(uniqueId('ngp-dialog'));

  /** The dialog role. */
  readonly role = input(this.config.role, {
    alias: 'ngpDialogRole',
  });

  /** Whether the dialog is a modal. */
  readonly modal = input<boolean, BooleanInput>(this.config.modal ?? false, {
    alias: 'ngpDialogModal',
    transform: booleanAttribute,
  });

  /** The labelledby ids */
  protected readonly labelledBy = signal<string[]>([]);

  /** The describedby ids */
  protected readonly describedBy = signal<string[]>([]);

  ngOnDestroy(): void {
    this.close();
  }

  /** Close the dialog. */
  close(): void {
    this.dialogRef.close();
  }

  /** Stop click events from propagating to the overlay */
  @HostListener('click', ['$event'])
  protected onClick(event: Event): void {
    event.stopPropagation();
  }

  /** @internal register a labelledby id */
  setLabelledBy(id: string): void {
    this.labelledBy.update(ids => [...ids, id]);
  }

  /** @internal register a describedby id */
  setDescribedBy(id: string): void {
    this.describedBy.update(ids => [...ids, id]);
  }

  /** @internal remove a labelledby id */
  removeLabelledBy(id: string): void {
    this.labelledBy.update(ids => ids.filter(i => i !== id));
  }

  /** @internal remove a describedby id */
  removeDescribedBy(id: string): void {
    this.describedBy.update(ids => ids.filter(i => i !== id));
  }
}
