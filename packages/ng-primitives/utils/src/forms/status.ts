import {
  DestroyRef,
  Injector,
  Signal,
  WritableSignal,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { onDestroy, onMount } from 'ng-primitives/state';
import { Subscription } from 'rxjs';
import { safeTakeUntilDestroyed } from '../observables/take-until-destroyed';
import { FormFieldSource } from './types';

export interface NgpControlStatus {
  valid: boolean | null;
  invalid: boolean | null;
  pristine: boolean | null;
  dirty: boolean | null;
  touched: boolean | null;
  pending: boolean | null;
  errors: string[] | null;
  disabled: boolean | null;
}

const initialStatus: NgpControlStatus = {
  valid: null,
  invalid: null,
  pristine: null,
  dirty: null,
  touched: null,
  pending: null,
  disabled: null,
  errors: null,
};

/**
 * Create a reactive signal that tracks the status of an Angular form control.
 *
 * The control can be provided as a signal-based source (`FormFieldSource`, such as a
 * signal `FieldTree` or interop control) or as a `NgControl`/classic `AbstractControl`.
 *
 * - Signal-based controls are read directly through their signal getters.
 * - Classic controls are derived from the control and re-synced on `control.events`.
 *
 * If neither `source` nor `control` is provided, the nearest injected `NgControl` is used.
 * @param options The options for the status.
 * @param options.source A signal resolving to a `FormFieldSource` (signal-based control) or `NgControl`.
 * @param options.control A signal resolving to a `NgControl`, used when no `source` is provided.
 * @returns A reactive signal of the control's current status.
 */
export function controlStatus(options?: {
  source?: Signal<FormFieldSource | null | undefined>;
  control?: Signal<NgControl | null | undefined>;
}): Signal<NgpControlStatus> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const status = signal(initialStatus);

  const optionSource = linkedSignal(() => options?.source?.() ?? options?.control?.());

  setupForSignal(optionSource, status, injector);
  setupForObservable(optionSource, status, destroyRef, injector);

  return status;
}

/**
 * Set up the status for a signal-based control by reading its signal getters.
 * @internal
 */
function setupForSignal(
  source: Signal<FormFieldSource | NgControl | null | undefined>,
  status: WritableSignal<NgpControlStatus>,
  injector: Injector,
): void {
  effect(
    () => {
      const s = source();

      if (!s) {
        status.set(initialStatus);
        return;
      }

      if (typeof s !== 'function') {
        return;
      }

      // No need to subscribe to anything since everything is signal based
      status.set({
        valid: s().valid(),
        invalid: s().invalid(),
        pristine: !s().dirty(),
        dirty: s().dirty(),
        touched: s().touched(),
        pending: s().pending(),
        errors: s()
          .errors()
          .map(x => x.kind),
        disabled: s().disabled(),
      });
    },
    { injector },
  );
}

/**
 * Set up the status for a `NgControl` or classic `AbstractControl`, re-syncing on
 * `control.events`. Falls back to the injected `NgControl` when no source is provided.
 * @internal
 */
function setupForObservable(
  source: WritableSignal<FormFieldSource | NgControl | null | undefined>,
  status: WritableSignal<NgpControlStatus>,
  destroyRef: DestroyRef,
  injector: Injector,
) {
  let subscription: Subscription | undefined;
  const control = linkedSignal<AbstractControl | null>(() => {
    const s = source();

    if (!s || typeof s === 'function') {
      return null;
    }

    if ('control' in s) {
      return s.control;
    }

    return s;
  });

  function updateStatus(control: AbstractControl) {
    // For interop controls, read directly from the control (which has signal getters).
    // For classic controls, read from the underlying AbstractControl.
    const source = isInteropControl(control) ? control : ((control as any).control ?? control);

    try {
      untracked(() =>
        status.set({
          valid: source.valid ?? null,
          invalid: source.invalid ?? null,
          pristine: source.pristine ?? null,
          dirty: source.dirty ?? null,
          touched: source.touched ?? null,
          pending: source.pending ?? null,
          disabled: source.disabled ?? null,
          errors: source.errors ? Object.keys(source.errors!) : null,
        }),
      );
    } catch {
      // NG0950: Required input not available yet. The effect will re-run
      // when the signal input becomes available.
    }
  }

  function setup(control: AbstractControl) {
    if (control.events) {
      subscription = control.events
        .pipe(safeTakeUntilDestroyed(destroyRef))
        .subscribe(() => updateStatus(control));
    }
  }

  onDestroy(() => {
    subscription?.unsubscribe();
  });

  onMount(() => {
    if (!source()) {
      const ngControl = inject(NgControl, { optional: true });
      source.set(ngControl?.control ?? null);
    }
  });

  effect(
    () => {
      const c = control();

      subscription?.unsubscribe();

      if (c) {
        setup(c);
        updateStatus(c);
      }
    },
    { injector },
  );
}

/**
 * Detects an Angular signal-forms interop control without importing any of the new
 * signal-form types. Interop controls expose a `field()` method which returns the
 * underlying FieldState.
 */
function isInteropControl(control: unknown | null | undefined): boolean {
  return !!control && typeof (control as any).field === 'function';
}
