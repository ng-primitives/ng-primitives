import { DestroyRef, Signal, WritableSignal, afterNextRender, inject, signal } from '@angular/core';
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

function setStatusSignal(
  control: NgControl | null,
  status: WritableSignal<NgpControlStatus>,
): void {
  if (!control?.control) {
    return;
  }

  status.set({
    valid: control?.control?.valid ?? null,
    invalid: control?.control?.invalid ?? null,
    pristine: control?.control?.pristine ?? null,
    dirty: control?.control?.dirty ?? null,
    touched: control?.control?.touched ?? null,
    pending: control?.control?.pending ?? null,
    disabled: control?.control?.disabled ?? null,
  });
}

function subscribeToControlStatus(
  control: NgControl | null,
  status: WritableSignal<NgpControlStatus>,
  destroyRef?: DestroyRef,
): void {
  if (!control?.control) {
    return;
  }

  control.control.events
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(() => setStatusSignal(control, status));
}

/**
 * A utility function to get the status of an Angular form control as a reactive signal.
 * This function injects the NgControl and returns a signal that reflects the control's status.
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

  // Fallback if control is not yet available
  if (!control?.control) {
    // There is still a chance that the control will be available i.e. after executing OnInit lifecycle hook
    // in `formControlName` directive, so we set up an effect to subscribe to the control status
    afterNextRender({
      write: () => {
        // If control is still not available, we do nothing, otherwise we subscribe to the control status
        if (control?.control) {
          subscribeToControlStatus(control, status, destroyRef);
          // We re-set the status to ensure it reflects the current state on initialization
          setStatusSignal(control, status);
        }
      },
    });
    return status;
  }

  subscribeToControlStatus(control, status);

  return status;
}
