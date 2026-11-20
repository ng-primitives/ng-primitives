import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, input, output, TemplateRef } from '@angular/core';
import { dismissGuardAttribute, NgpDismissGuard, NgpDismissGuardInput } from 'ng-primitives/portal';
import { coerceBooleanOrUndefined } from 'ng-primitives/utils';
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

  /**
   * The container element or selector the dialog should be rendered into. `undefined` uses the
   * dialog configuration, `null` renders into the body.
   * @default 'body'
   */
  readonly container = input<HTMLElement | string | null | undefined>(
    this.config.container ?? 'body',
    {
      alias: 'ngpDialogTriggerContainer',
    },
  );

  /**
   * Whether the dialog is modal. A non-modal dialog, such as a drawer, leaves the page usable.
   * `undefined` uses `modal` from the dialog configuration, not from a dialog the trigger is in.
   * @default `true`
   */
  readonly modal = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpDialogTriggerModal',
    transform: coerceBooleanOrUndefined,
  });

  /** Emits whenever the dialog is closed with the given result. */
  readonly closed = output<T>({ alias: 'ngpDialogTriggerClosed' });

  protected readonly state = ngpDialogTrigger({
    template: this.template,
    closeOnEscape: this.closeOnEscape,
    closeOnOutsideClick: this.closeOnOutsideClick,
    container: this.container,
    modal: this.modal,
    onClosedChange: (value: T) => this.closed.emit(value),
  });
}
