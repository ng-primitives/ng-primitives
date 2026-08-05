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

// Avoid multiple patch from different `controlStatus` on the same NgControl
interface PatchState {
  consumers: { ngControl: NgControl; status: WritableSignal<NgpControlStatus> }[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  originalMethods: Record<string, Function>;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  patchedMethods: Record<string, Function>;
}

const patchRegistry = new WeakMap<NgControl, PatchState>();

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

    const newStatus: NgpControlStatus = {
      valid: source.valid ?? null,
      invalid: source.invalid ?? null,
      pristine: source.pristine ?? null,
      dirty: source.dirty ?? null,
      touched: source.touched ?? null,
      pending: source.pending ?? null,
      disabled: source.disabled ?? null,
      errors: source.errors ? Object.keys(source.errors) : null,
      required:
        (source.hasValidator(Validators.required) ||
          source.hasValidator(Validators.requiredTrue)) ??
        null,
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

/**
 * Patches the underlying control's validator mutators so that adding/removing
 * validators re-reads the control status. Classic `AbstractControl` mutators
 * (`setValidators`, `addValidators`, `removeValidators`, ...) do not emit any
 * events, so without this the `required` state (derived from `hasValidator`)
 * would stay stale until an unrelated value/status change.
 *
 * Implementation details:
 *
 * A global `WeakMap` tracks patch state per `AbstractControl`. It stores:
 * - the original validator methods
 * - the patched methods
 * - a list of consumers (each with its `NgControl` and `status` signal)
 *
 * On the first consumer: the original methods are saved, patched versions are
 * installed on the control, and the consumer is registered.
 *
 * On subsequent consumers: they are added to the consumer list without
 * re-patching the control.
 *
 * When validators change: the patched method notifies all registered consumers
 * by calling `updateStatus` with their respective status signals.
 *
 * On cleanup: the consumer is removed from the list. If no consumers remain,
 * the original methods are restored and the `WeakMap` entry is deleted.
 * @internal
 */
function setupValidatorChangeSubscription(
  ngControl: NgControl,
  status: WritableSignal<NgpControlStatus>,
): () => void {
  // For classic controls, also subscribe to the events observable.
  const underlyingControl = (ngControl as any).control;

  // Signal-forms interop controls don't expose `setValidators` — skip them.
  // They're already reactive: `hasValidator(Validators.required)` reads
  // `field().required()`, a signal tracked by the effect below.
  if (!underlyingControl || typeof underlyingControl.setValidators !== 'function') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {}; // no-op unpatch
  }

  let state = patchRegistry.get(underlyingControl);

  if (!state) {
    // First consumer: save true originals, create patched versions
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const originalMethods: Record<string, Function> = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const patchedMethods: Record<string, Function> = {};

    // `setValidators`/`setAsyncValidators` are the primitives that every other
    // mutator (`addValidators`, `removeValidators`, `addAsyncValidators`,
    // `removeAsyncValidators`) delegates to on `AbstractControl`.
    for (const method of [
      'setValidators',
      'setAsyncValidators',
      'clearValidators',
      'clearAsyncValidators',
    ] as const) {
      const original = underlyingControl[method].bind(underlyingControl);

      originalMethods[method] = original;

      patchedMethods[method] = (...args: unknown[]) => {
        original(...args);

        // state is guaranteed non-null here: the patched method only runs after
        // the first consumer creates the PatchState entry (which includes itself).
        for (const consumer of state!.consumers) {
          updateStatus(ngControl, consumer.status);
        }
      };

      underlyingControl[method] = patchedMethods[method];
    }

    state = { consumers: [{ ngControl, status }], originalMethods, patchedMethods };
    patchRegistry.set(underlyingControl, state);
  } else {
    state.consumers.push({ ngControl, status });
  }

  return () => {
    const currentState = patchRegistry.get(underlyingControl);

    if (!currentState) {
      return;
    }

    currentState.consumers = currentState.consumers.filter(
      x => x.ngControl !== ngControl && x.status() !== status(),
    );

    // If no consumers remain, restore original methods and delete the WeakMap entry
    if (currentState.consumers.length === 0) {
      for (const [method, original] of Object.entries(currentState.originalMethods)) {
        underlyingControl[method] = original;
      }

      patchRegistry.delete(underlyingControl);
    }
  };
}

export function controlStatus(
  ngControl?: Signal<NgControl | null | undefined>,
): Signal<NgpControlStatus> {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);

  const status = signal<NgpControlStatus>({
    valid: null,
    invalid: null,
    pristine: null,
    dirty: null,
    touched: null,
    pending: null,
    disabled: null,
    errors: null,
    required: null,
  });

  const control = linkedSignal<NgControl | null>(() => ngControl?.() ?? null);

  let currentCleanup: {
    eventSubscription?: Subscription;
    unpatch?: () => void;
  } = {};

  function cleanup(): void {
    currentCleanup.eventSubscription?.unsubscribe();
    currentCleanup.unpatch?.();
    currentCleanup = {};
  }

  function setup(ngControl: NgControl): void {
    // Set up event subscription for reactive updates
    currentCleanup.eventSubscription = setupEventSubscription(ngControl, status, destroyRef);

    // Set up validator "subscription" for reactive updates
    currentCleanup.unpatch = setupValidatorChangeSubscription(ngControl, status);
  }

  onMount(() => {
    if (!control()) {
      // Try to inject NgControl immediately for initial state
      control.set(inject(NgControl, { optional: true }));
    }

    if (control()) {
      updateStatus(control()!, status);
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
      }
    },
    { injector },
  );

  return status;
}
