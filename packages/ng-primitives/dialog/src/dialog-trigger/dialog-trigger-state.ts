import { ElementRef, Signal, TemplateRef, inject, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
import { createPrimitive, emitter, listener, StateInjectionOptions } from 'ng-primitives/state';
import { Observable } from 'rxjs';
import { NgpDialogRef } from '../dialog/dialog-ref';
import { NgpDialogContext, NgpDialogManager } from '../dialog/dialog.service';

export interface NgpDialogTriggerState<T> {
  /** Access the component's reference. */
  readonly elementRef: ElementRef;
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
    onClosedChange,
  }: NgpDialogTriggerProps<T>) => {
    const elementRef = injectElementRef();
    const dialogManager = inject(NgpDialogManager);

    const dialogRef = signal<NgpDialogRef | null>(null);

    const closed = emitter<T>();

    // Listener
    listener(elementRef, 'click', handleClick);

    function handleClick(): void {
      dialogRef.set(
        dialogManager.open(template(), {
          closeOnEscape: closeOnEscape(),
          closeOnOutsideClick: closeOnOutsideClick(),
        }),
      );

      dialogRef()!.closed.subscribe(({ result }) => {
        onClosedChange?.(result as T);
        closed.emit(result as T);
        return dialogRef.set(null);
      });
    }

    return {
      elementRef,
      template,
      closeOnEscape,
      closeOnOutsideClick,
      closedChange: closed.asObservable(),
    } satisfies NgpDialogTriggerState<T>;
  },
);

export function injectDialogTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpDialogTriggerState<T>> {
  return _injectDialogTriggerState(options) as Signal<NgpDialogTriggerState<T>>;
}
