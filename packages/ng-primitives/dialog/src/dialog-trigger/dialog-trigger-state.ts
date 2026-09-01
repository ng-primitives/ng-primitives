import { DestroyRef, Injector, Signal, TemplateRef, inject, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDismissGuard } from 'ng-primitives/portal';
import { createPrimitive, emitter, listener, StateInjectionOptions } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectDialogConfig } from '../config/dialog-config';
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
   * The container element or selector the dialog should be rendered into.
   * @default 'body'
   */
  readonly container?: Signal<HTMLElement | string | null>;
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
   * The container element or selector the dialog should be rendered into.
   * @default 'body'
   */
  readonly container?: Signal<HTMLElement | string | null>;
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
    container = signal(injectDialogConfig().container ?? 'body'),
    onClosedChange,
  }: NgpDialogTriggerProps<T>) => {
    const elementRef = injectElementRef();
    const dialogManager = inject(NgpDialogManager);
    const destroyRef = inject(DestroyRef);
    // Pass the trigger's injector so dialog content resolves DI from the component
    // subtree, not the root injector. See #823.
    const injector = inject(Injector);

    const closed = emitter<T>();

    // Listener
    listener(elementRef, 'click', handleClick);

    function handleClick(): void {
      const dialogRef = dialogManager.open(template(), {
        injector,
        closeOnEscape: closeOnEscape(),
        closeOnOutsideClick: closeOnOutsideClick(),
        container: container(),
      });

      dialogRef.closed.pipe(safeTakeUntilDestroyed(destroyRef)).subscribe(({ result }) => {
        onClosedChange?.(result as T);
        closed.emit(result as T);
      });
    }

    return {
      template,
      closeOnEscape,
      closeOnOutsideClick,
      container,
      closedChange: closed.asObservable(),
    } satisfies NgpDialogTriggerState<T>;
  },
);

export function injectDialogTriggerState<T>(
  options?: StateInjectionOptions,
): Signal<NgpDialogTriggerState<T>> {
  return _injectDialogTriggerState(options) as Signal<NgpDialogTriggerState<T>>;
}
