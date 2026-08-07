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
import { NgControl, Validators } from '@angular/forms';
import { onDestroy, onMount } from 'ng-primitives/state';
import { Subscription } from 'rxjs';
import { safeTakeUntilDestroyed } from '../observables/take-until-destroyed';

export interface NgpControlStatus {
  valid: boolean | null;
  invalid: boolean | null;
  pristine: boolean | null;
  dirty: boolean | null;
  touched: boolean | null;
  pending: boolean | null;
  disabled: boolean | null;
  errors: string[] | null;
  required: boolean | null;
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
    const hasValidatorExists = typeof source.hasValidator === 'function';

    const newStatus: NgpControlStatus = {
      valid: source.valid ?? null,
      invalid: source.invalid ?? null,
      pristine: source.pristine ?? null,
      dirty: source.dirty ?? null,
      touched: source.touched ?? null,
      pending: source.pending ?? null,
      disabled: source.disabled ?? null,
      errors: source.errors ? Object.keys(source.errors) : null,
      required: hasValidatorExists
        ? // In signal forms, the hasValidators checks for field().required() which is a signal
          // Otherwise, it'll trigger the base hasValidator method, returning a boolean
          //
          // As hasValidator only check references on a array of validator, that means
          // using Validators.compose(Validators.required) will not be flagged as required
          // That's the only limitation of this API
          source.hasValidator(Validators.required) ||
          source.hasValidator(Validators.requiredTrue) ||
          null
        : null,
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
/**
 * Sets up event subscription for a given NgControl.
 * Only sets up the subscription - does not call updateStatus.
 */
function setupEventSubscription(
  ngControl: NgControl,
  status: WritableSignal<NgpControlStatus>,
  destroyRef: DestroyRef,
): Subscription | undefined {
  // For classic controls, also subscribe to the events observable.
  const underlyingControl = (ngControl as any).control;
  if (underlyingControl?.events) {
    return underlyingControl.events
      .pipe(safeTakeUntilDestroyed(destroyRef))
      .subscribe(() => updateStatus(ngControl, status));
  }

  return undefined;
}

export function controlStatus(
  ngControl?: Signal<NgControl | null | undefined>,
): Signal<NgpControlStatus> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);

  const initialStatus: NgpControlStatus = {
    valid: null,
    invalid: null,
    pristine: null,
    dirty: null,
    touched: null,
    pending: null,
    disabled: null,
    errors: null,
    required: null,
  };

  const status = signal<NgpControlStatus>(initialStatus);
  let eventSubscription: Subscription | undefined = undefined;

  const control = linkedSignal<NgControl | null>(() => ngControl?.() ?? null);

  function cleanup(): void {
    eventSubscription?.unsubscribe();
  }

  function setup(ngControl: NgControl): void {
    // Set up event subscription for reactive updates
    eventSubscription = setupEventSubscription(ngControl, status, destroyRef);
  }

  onMount(() => {
    if (!control()) {
      // Try to inject NgControl immediately for initial state
      control.set(inject(NgControl, { optional: true }));
    }
  });

  onDestroy(() => {
    cleanup();
  });

  // Use an effect to reactively track status changes.
  // For signal-forms interop controls, the status properties are signals.
  // For classic controls, this will read the current values and establish
  // no signal dependencies, but we also subscribe to events below.
  effect(
    () => {
      const c = control();

      cleanup();

      if (c) {
        setup(c);
        updateStatus(c, status);
      } else {
        untracked(() => status.set(initialStatus));
      }
    },
    { injector },
  );

  return status;
}
