import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { provideFocusTrapState } from 'ng-primitives/focus-trap';
import { NgpExitAnimation } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectDialogConfig } from '../config/dialog-config';
import { injectDialogRef } from './dialog-ref';
import { ngpDialog, provideDialogState } from './dialog-state';

@Directive({
  selector: '[ngpDialog]',
  exportAs: 'ngpDialog',
  providers: [provideDialogState(), provideFocusTrapState()],
  hostDirectives: [NgpExitAnimation],
})
export class NgpDialog<T = unknown, R = unknown> {
  private readonly config = injectDialogConfig();

  /** The id of the dialog */
  readonly id = input<string>(uniqueId('ngp-dialog'));

  /** The dialog role. */
  readonly role = input(this.config.role, {
    alias: 'ngpDialogRole',
  });

  /**
   * Whether the dialog is a modal, reflected in `aria-modal`. Defaults to the `modal` the dialog
   * was opened with, which decides its behaviour.
   */
  readonly modal = input<boolean, BooleanInput>(injectDialogRef().config.modal !== false, {
    alias: 'ngpDialogModal',
    transform: booleanAttribute,
  });

  /** The dialog state */
  protected readonly state = ngpDialog<T, R>({
    id: this.id,
    role: this.role,
    modal: this.modal,
  });

  /** Close the dialog. */
  close(result?: R): void {
    return this.state.close(result);
  }

  /** @internal register a labelledby id */
  setLabelledBy(id: string): void {
    return this.state.setLabelledBy(id);
  }

  /** @internal register a describedby id */
  setDescribedBy(id: string): void {
    return this.state.setDescribedBy(id);
  }

  /** @internal remove a labelledby id */
  removeLabelledBy(id: string): void {
    return this.state.removeLabelledBy(id);
  }

  /** @internal remove a describedby id */
  removeDescribedBy(id: string): void {
    return this.state.removeDescribedBy(id);
  }
}
