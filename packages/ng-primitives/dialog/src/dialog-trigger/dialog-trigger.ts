import { Directive, HostListener, inject, input, TemplateRef } from '@angular/core';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';
import { defaultDialogConfig } from '../config/dialog-config';

@Directive({
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
})
export class NgpDialogTrigger {
  /** Access the dialog manager. */
  private readonly dialogManager = inject(NgpDialogManager);

  /** The template to launch. */
  readonly template = input.required<TemplateRef<NgpDialogContext>>({
    alias: 'ngpDialogTrigger',
  });

  /**
   * Whether the escape key is allowed to close the dialog.
   * @default `false`

   */
  readonly disableEscapeKey = input(false, {
    alias: 'ngpDialogTriggerDisableEscapeKey',
  });

  /**
   * Store the dialog ref.
   * @internal
   */
  private dialogRef: NgpDialogRef | null = null;

  @HostListener('click')
  protected launch(): void {
    this.dialogRef = this.dialogManager.open(this.template(), {
      ...defaultDialogConfig,
      disableEscapeKey: this.disableEscapeKey(),
    });
    this.dialogRef.closed.subscribe(() => (this.dialogRef = null));
  }
}
