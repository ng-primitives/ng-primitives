import { FocusMonitor } from '@angular/cdk/a11y';
import { Directive, ElementRef, HostListener, inject, input, TemplateRef } from '@angular/core';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';

@Directive({
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
})
export class NgpDialogTrigger {
  /** Access the dialog manager. */
  private readonly dialogManager = inject(NgpDialogManager);

  /** Access the focus monitor. */
  private readonly focusMonitor = inject(FocusMonitor);

  /** Access the element ref. */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The template to launch. */
  readonly template = input.required<TemplateRef<NgpDialogContext>>({
    alias: 'ngpDialogTrigger',
  });

  /**
   * Store the dialog ref.
   * @internal
   */
  private dialogRef: NgpDialogRef | null = null;

  @HostListener('click')
  protected launch(): void {
    this.dialogRef = this.dialogManager.open(this.template());

    this.dialogRef.closed.subscribe(focusOrigin => {
      this.dialogRef = null;
      // Focus the trigger element after the dialog closes.
      this.focusMonitor.focusVia(this.elementRef.nativeElement, focusOrigin);
    });
  }
}
