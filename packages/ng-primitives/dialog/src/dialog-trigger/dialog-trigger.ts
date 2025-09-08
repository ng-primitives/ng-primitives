import { Directive, HostListener, inject, input, output, TemplateRef } from '@angular/core';
import { injectDialogConfig } from '../config/dialog-config';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';

@Directive({
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
})
export class NgpDialogTrigger<T = unknown> {
  /** Access the global configuration */
  private readonly config = injectDialogConfig();

  /** Access the dialog manager. */
  private readonly dialogManager = inject(NgpDialogManager);

  /** The template to launch. */
  readonly template = input.required<TemplateRef<NgpDialogContext>>({
    alias: 'ngpDialogTrigger',
  });

  /** Emits whenever the dialog is closed with the given result. */
  readonly closed = output<T>({ alias: 'ngpDialogTriggerClosed' });

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
    this.dialogRef.closed.subscribe(({ result }) => {
      this.closed.emit(result as T);
      return (this.dialogRef = null);
    });
  }
}
