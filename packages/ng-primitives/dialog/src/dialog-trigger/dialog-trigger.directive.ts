/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ApplicationRef,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';
import { NgpDialogTriggerToken } from './dialog-trigger.token';

@Directive({
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
  providers: [{ provide: NgpDialogTriggerToken, useExisting: NgpDialogTrigger }],
})
export class NgpDialogTrigger {
  /** Access the dialog manager. */
  private readonly dialogManager = inject(NgpDialogManager);

  /** Access the application ref. */
  private readonly applicationRef = inject(ApplicationRef);

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
    // this is not ideal, but there is a case where a dialog trigger is within an overlay (e.g. menu),
    // which may be removed before the dialog is closed. This is not desired, so we need to access a view container ref
    // that is not within the overlay. To solve this we use the view container ref of the root component.
    // Could this have any unintended side effects? For example, the dialog would not be closed during route changes?
    const viewContainerRef = this.applicationRef.components[0].injector.get(ViewContainerRef);

    this.dialogRef = this.dialogManager.open(this.template(), {
      viewContainerRef,
    });

    this.dialogRef.closed.subscribe(focusOrigin => {
      this.dialogRef = null;
      // Focus the trigger element after the dialog closes.
      this.focusMonitor.focusVia(this.elementRef.nativeElement, focusOrigin);
    });
  }
}
