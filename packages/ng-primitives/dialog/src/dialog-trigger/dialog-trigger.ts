import { Directive, input, output, TemplateRef } from '@angular/core';
import { dismissGuardAttribute, NgpDismissGuard, NgpDismissGuardInput } from 'ng-primitives/portal';
import { injectDialogConfig } from '../config/dialog-config';
import { NgpDialogContext } from '../dialog/dialog.service';
import { ngpDialogTrigger } from './dialog-trigger-state';

@Directive({
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
})
export class NgpDialogTrigger<T = unknown> {
  /** Access the global configuration */
  private readonly config = injectDialogConfig();

  /** The template to launch. */
  readonly template = input.required<TemplateRef<NgpDialogContext>>({
    alias: 'ngpDialogTrigger',
  });

  /**
   * Whether the dialog should close on escape, or a guard function.
   * @default `true`
   */
  readonly closeOnEscape = input<
    NgpDismissGuard<KeyboardEvent>,
    NgpDismissGuardInput<KeyboardEvent>
  >(this.config.closeOnEscape ?? true, {
    alias: 'ngpDialogTriggerCloseOnEscape',
    transform: dismissGuardAttribute,
  });

  /**
   * Whether the dialog should close on outside click, or a guard function.
   * @default `true`
   */
  readonly closeOnOutsideClick = input<NgpDismissGuard<Element>, NgpDismissGuardInput<Element>>(
    this.config.closeOnOutsideClick ?? true,
    {
      alias: 'ngpDialogTriggerCloseOnOutsideClick',
      transform: dismissGuardAttribute,
    },
  );

  /** Emits whenever the dialog is closed with the given result. */
  readonly closed = output<T>({ alias: 'ngpDialogTriggerClosed' });

  protected readonly state = ngpDialogTrigger({
    template: this.template,
    closeOnEscape: this.closeOnEscape,
    closeOnOutsideClick: this.closeOnOutsideClick,
    onClosedChange: this.closed.emit,
  });
}
