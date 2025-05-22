import { Directive, HostListener, inject, input, TemplateRef } from '@angular/core';
import { injectDialogConfig } from '../config/dialog-config';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';

@Directive({
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
})
export class NgpDialogTrigger {
  /** Access the global configuration */
  private readonly config = injectDialogConfig();

  /** Access the dialog manager. */
  private readonly dialogManager = inject(NgpDialogManager);

  /** The template to launch. */
  readonly template = input.required<TemplateRef<NgpDialogContext>>({
    alias: 'ngpDialogTrigger',
  });

  /**
   * Whether the dialog should close on escape.
   * @default `true`
   */
  readonly closeOnEscape = input(this.config.closeOnEscape, {
    alias: 'ngpDialogTriggerCloseOnEscape',
  });

  /**
   * Store the dialog ref.
   * @internal
   */
  private dialogRef: NgpDialogRef | null = null;

  @HostListener('click')
  protected launch(): void {
    this.dialogRef = this.dialogManager.open(this.template(), {
      closeOnEscape: this.closeOnEscape(),
    });
    this.dialogRef.closed.subscribe(() => (this.dialogRef = null));
  }
}
