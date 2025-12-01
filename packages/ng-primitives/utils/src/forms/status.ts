import {
  DestroyRef,
  Signal,
  WritableSignal,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { safeTakeUntilDestroyed } from '../observables/take-until-destroyed';

export interface NgpControlStatus {
  valid: boolean | null;
  invalid: boolean | null;
  pristine: boolean | null;
  dirty: boolean | null;
  touched: boolean | null;
  pending: boolean | null;
  disabled: boolean | null;
}

/**
 * Detects an Angular signal-forms interop control without importing any of the new
 * signal-form types. Interop controls expose a `field()` method which returns the
 * underlying FieldState.
 */
function isInteropControl(control: NgControl | null | undefined): boolean {
  return !!control && typeof (control as any).field === 'function';
}

/**
 * Reads status from a control and updates the status signal.
 * Wrapped in try-catch to handle signal-forms interop controls where
 * the `field` input may not be available yet (throws NG0950).
 */
function updateStatus(control: NgControl, status: WritableSignal<NgpControlStatus>): void {
  try {
    // For interop controls, read directly from the control (which has signal getters).
    // For classic controls, read from the underlying AbstractControl.
    const source = isInteropControl(control) ? control : ((control as any).control ?? control);

    const newStatus: NgpControlStatus = {
      valid: source.valid ?? null,
      invalid: source.invalid ?? null,
      pristine: source.pristine ?? null,
      dirty: source.dirty ?? null,
      touched: source.touched ?? null,
      pending: source.pending ?? null,
      disabled: source.disabled ?? null,
    };

    untracked(() => status.set(newStatus));
  } catch {
    // NG0950: Required input not available yet. The effect will re-run
    // when the signal input becomes available.
  }
}

/**
 * A utility function to get the status of an Angular form control as a reactive signal.
 * This function injects the NgControl and returns a signal that reflects the control's status.
 * It supports both classic reactive forms controls and signal-forms interop controls.
 * @internal
 */
export function controlStatus(): Signal<NgpControlStatus> {
  const control = inject(NgControl, { optional: true });
  const destroyRef = inject(DestroyRef);

  const status = signal<NgpControlStatus>({
    valid: null,
    invalid: null,
    pristine: null,
    dirty: null,
    touched: null,
    pending: null,
    disabled: null,
  });

  if (!control) {
    return status;
  }

  // Use an effect to reactively track status changes.
  // For signal-forms interop controls, the status properties are signals.
  // For classic controls, this will read the current values and establish
  // no signal dependencies, but we also subscribe to events below.
  effect(() => {
    updateStatus(control, status);
  });

  // For classic controls, also subscribe to the events observable.
  const underlyingControl = (control as any).control;
  if (underlyingControl?.events) {
    underlyingControl.events
      .pipe(safeTakeUntilDestroyed(destroyRef))
      .subscribe(() => updateStatus(control, status));
  }

  return status;
}
