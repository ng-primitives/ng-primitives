import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input, OnDestroy, signal } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectDialogConfig } from '../config/dialog-config';
import { injectDialogRef } from './dialog-ref';
import { dialogState, provideDialogState } from './dialog-state';

@Directive({
  selector: '[ngpDialog]',
  exportAs: 'ngpDialog',
  providers: [provideDialogState()],
  hostDirectives: [NgpFocusTrap, NgpExitAnimation],
  host: {
    tabindex: '-1',
    '[id]': 'state.id()',
    '[attr.role]': 'state.role()',
    '[attr.aria-modal]': 'state.modal()',
    '[attr.aria-labelledby]': 'labelledBy().join(" ")',
    '[attr.aria-describedby]': 'describedBy().join(" ")',
  },
})
export class NgpDialog<T = unknown, R = unknown> implements OnDestroy {
  private readonly config = injectDialogConfig();

  /** Access the dialog ref */
  private readonly dialogRef = injectDialogRef<T, R>();

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

  /** The dialog state */
  protected readonly state = dialogState<NgpDialog<T, R>>(this);

  ngOnDestroy(): void {
    this.close();
  }

  /** Close the dialog. */
  close(result?: R): void {
    this.dialogRef.close(result);
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
