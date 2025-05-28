import { Signal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';

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
 * A utility function to get the status of an Angular form control as a reactive signal.
 * This function injects the NgControl and returns a signal that reflects the control's status.
 * @internal
 */
export function controlStatus(): Signal<NgpControlStatus> {
  const control = inject(NgControl, { optional: true });

  const status = signal<NgpControlStatus>({
    valid: null,
    invalid: null,
    pristine: null,
    dirty: null,
    touched: null,
    pending: null,
    disabled: null,
  });

  // Fallback if control is not yet available
  if (!control?.control) {
    return status;
  }

  control.control.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
    status.set({
      valid: control?.control?.valid ?? null,
      invalid: control?.control?.invalid ?? null,
      pristine: control?.control?.pristine ?? null,
      dirty: control?.control?.dirty ?? null,
      touched: control?.control?.touched ?? null,
      pending: control?.control?.pending ?? null,
      disabled: control?.control?.disabled ?? null,
    });
  });

  return status;
}
