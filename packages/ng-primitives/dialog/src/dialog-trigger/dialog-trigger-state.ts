import { DestroyRef, Injector, Signal, TemplateRef, inject, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
import {
  attrBinding,
  createPrimitive,
  emitter,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectDialogConfig } from '../config/dialog-config';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';

export interface NgpDialogTriggerState<T> {
  /** The template to launch. */
  readonly template?: Signal<TemplateRef<NgpDialogContext>>;
  /**
   * Whether the dialog should close on escape, or a guard function.
   * @default `true`
   */
  readonly closeOnEscape?: Signal<NgpDismissGuard<KeyboardEvent>>;
  /**
   * Whether the dialog should close on outside click, or a guard function.
   * @default `true`
   */
  readonly closeOnOutsideClick?: Signal<NgpDismissGuard<Element>>;
  /**
   * The container element or selector the dialog should be rendered into. `undefined` uses the
   * dialog configuration, `null` renders into the body.
   */
  readonly container?: Signal<HTMLElement | string | null | undefined>;
  /**
   * Whether the dialog is modal. `undefined` uses `modal` from the dialog configuration.
   */
  readonly modal?: Signal<boolean | undefined>;
  /** The event that is fired when the closed state changes. */
  readonly closedChange: Observable<T>;
}

export interface NgpDialogTriggerProps<T> {
  /** The template to launch. */
  readonly template: Signal<TemplateRef<NgpDialogContext>>;
  /**
   * Whether the dialog should close on escape, or a guard function.
   * @default `true`
   */
  readonly closeOnEscape?: Signal<NgpDismissGuard<KeyboardEvent>>;
  /**
   * Whether the dialog should close on outside click, or a guard function.
   * @default `true`
   */
  readonly closeOnOutsideClick?: Signal<NgpDismissGuard<Element>>;
  /**
   * The container element or selector the dialog should be rendered into. `undefined` uses the
   * dialog configuration, `null` renders into the body.
   */
  readonly container?: Signal<HTMLElement | string | null | undefined>;
  /**
   * Whether the dialog is modal. `undefined` uses `modal` from the dialog configuration.
   */
  readonly modal?: Signal<boolean | undefined>;
  readonly onClosedChange?: (value: T) => void;
}

export const [
  NgpDialogTriggerStateToken,
  ngpDialogTrigger,
  _injectDialogTriggerState,
  provideDialogTriggerState,
] = createPrimitive(
  'NgpDialogTrigger',
  <T>({
    template,
    closeOnEscape = signal<NgpDismissGuard<KeyboardEvent>>(true),
    closeOnOutsideClick = signal<NgpDismissGuard<Element>>(true),
    container = signal<HTMLElement | string | null | undefined>(undefined),
    modal = signal<boolean | undefined>(undefined),
    onClosedChange,
  }: NgpDialogTriggerProps<T>) => {
    const config = injectDialogConfig();
    const elementRef = injectElementRef();
    const dialogManager = inject(NgpDialogManager);
    const destroyRef = inject(DestroyRef);
    // Pass the trigger's injector so dialog content resolves DI from the component
    // subtree, not the root injector. See #823.
    const injector = inject(Injector);

    const closed = emitter<T>();

    // The dialog this trigger opened last, until it starts closing.
    const openDialog = signal<NgpDialogRef | null>(null);

    // Host bindings
    attrBinding(elementRef, 'aria-expanded', () => (openDialog() ? 'true' : 'false'));

    // Listener
    listener(elementRef, 'click', handleClick);

    function handleClick(): void {
      // A non-modal dialog leaves its trigger usable: a second click closes it.
      const current = openDialog();
      if (current && current.config.modal === false) {
        current.close();
        return;
      }

      const dialogRef = dialogManager.open(template(), {
        injector,
        triggerElement: elementRef.nativeElement,
        closeOnEscape: closeOnEscape(),
        closeOnOutsideClick: closeOnOutsideClick(),
        // resolve `undefined` here, the manager only sees the root configuration
        container: container() === undefined ? config.container : container(),
        modal: modal() ?? config.modal,
      });

      openDialog.set(dialogRef);

      // `closed` emits when closing starts, before the exit animation
      dialogRef.closed.pipe(safeTakeUntilDestroyed(destroyRef)).subscribe(({ result }) => {
        if (openDialog() === dialogRef) {
          openDialog.set(null);
        }
        onClosedChange?.(result as T);
        closed.emit(result as T);
      });
    }

    return {
      template,
      closeOnEscape,
      closeOnOutsideClick,
      container,
      modal,
      closedChange: closed.asObservable(),
    } satisfies NgpDialogTriggerState<T>;
  },
);

export function injectDialogTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpDialogTriggerState<T>> {
  return _injectDialogTriggerState(options) as Signal<NgpDialogTriggerState<T>>;
}
