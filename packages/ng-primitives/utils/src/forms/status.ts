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
import { FieldTree } from '@angular/forms/signals';
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

function buildFromAbstractControl<T>(
  control: AbstractControl<T>,
  status: WritableSignal<NgpControlStatus>,
  destroyRef: DestroyRef,
) {
  const buildStatus = (): NgpControlStatus => {
    return {
      valid: control.valid,
      invalid: control.invalid,
      pristine: control.pristine,
      dirty: control.dirty,
      touched: control.touched,
      pending: control.pending,
      errors: Object.keys(control.errors ?? []),
      disabled: control.disabled,
    };
  };

  status.set(buildStatus());

  // If any events is raised, we recalculate the status
  control.events
    .pipe(safeTakeUntilDestroyed(destroyRef))
    .subscribe(() => status.set(buildStatus()));
}

function buildFromFieldTree<T>(control: FieldTree<T>, status: WritableSignal<NgpControlStatus>) {
  // No need to subscribe to anything since everything is signal based
  status.set({
    valid: control().valid(),
    invalid: control().invalid(),
    pristine: !control().dirty(),
    dirty: control().dirty(),
    touched: control().touched(),
    pending: control().pending(),
    errors: control()
      .errors()
      .map(x => x.kind),
    disabled: control().disabled(),
  });
}

function isFieldTree<T>(value: unknown): value is FieldTree<T> {
  return !!value && typeof value === 'function';
}

function isAbstractControl<T>(value: unknown): value is AbstractControl<T> {
  return !!value && value instanceof AbstractControl;
}

export function sourceStatus<T>(
  source: Signal<FormFieldSource | null | undefined>,
): Signal<NgpControlStatus> {
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
  };

  const status = signal(initialStatus);

  const buildStatus = () => {
    if (isFieldTree(source())) {
      buildFromFieldTree<T>(source() as FieldTree<T>, status);
    } else if (isAbstractControl(source())) {
      buildFromAbstractControl(source() as AbstractControl<T>, status, destroyRef);
    }
  };

  effect(() => {
    const s = source();

    if (s) {
      buildStatus();
    } else {
      status.set(initialStatus);
    }
  });

  return status;
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
