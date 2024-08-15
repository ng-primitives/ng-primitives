/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';
import { NgpDialogTriggerToken } from './dialog-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
  providers: [{ provide: NgpDialogTriggerToken, useExisting: NgpDialogTrigger }],
  hostDirectives: [NgpButton],
})
export class NgpDialogTrigger {
  /** Access the dialog manager. */
  private readonly dialogManager = inject(NgpDialogManager);

  /** Access the view container ref. */
  private readonly viewContainerRef = inject(ViewContainerRef);

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
    this.dialogRef = this.dialogManager.open(this.template(), {
      viewContainerRef: this.viewContainerRef,
    });

    this.dialogRef.closed.subscribe(focusOrigin => {
      this.dialogRef = null;
      // Focus the trigger element after the dialog closes.
      this.focusMonitor.focusVia(this.elementRef.nativeElement, focusOrigin);
    });
  }
}
