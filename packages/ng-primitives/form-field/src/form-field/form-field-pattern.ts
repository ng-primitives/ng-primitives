import {
  DestroyRef,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  InjectOptions,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { Subscription } from 'rxjs';

/**
 * The state interface for the FormField pattern.
 */
export interface NgpFormFieldState {
  /**
   * Pristine signal.
   */
  pristine: Signal<boolean | null>;
  /**
   * Touched signal.
   */
  touched: Signal<boolean | null>;
  /**
   * Dirty signal.
   */
  dirty: Signal<boolean | null>;
  /**
   * Valid signal.
   */
  valid: Signal<boolean | null>;
  /**
   * Invalid signal.
   */
  invalid: Signal<boolean | null>;
  /**
   * Pending signal.
   */
  pending: Signal<boolean | null>;
  /**
   * Disabled signal.
   */
  disabled: Signal<boolean | null>;
  /**
   * Errors signal.
   */
  errors: Signal<string[]>;

  /**
   * SetFormControl method.
   */
  setFormControl: (id: string) => void;
  /**
   * AddLabel method.
   */
  addLabel: (label: string) => void;
  /**
   * AddDescription method.
   */
  addDescription: (description: string) => void;
  /**
   * RemoveFormControl method.
   */
  removeFormControl: () => void;
  /**
   * RemoveLabel method.
   */
  removeLabel: (label: string) => void;
  /**
   * RemoveDescription method.
   */
  removeDescription: (description: string) => void;
}

/**
 * The props interface for the FormField pattern.
 */
export interface NgpFormFieldProps {
  /**
   * The element reference for the form-field.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * The NgControl signal for the form-field.
   */
  ngControl?: Signal<NgControl | undefined>;
}

/**
 * The FormField pattern function.
 */
export function ngpFormFieldPattern({
  element = injectElementRef(),
  ngControl = signal<NgControl | undefined>(undefined),
}: NgpFormFieldProps = {}): NgpFormFieldState {
  const destroyRef = inject(DestroyRef);
  // Signals and computed values
  const labels = signal<string[]>([]);
  const descriptions = signal<string[]>([]);
  const formControl = signal<string | null>(null);
  const errors = signal<string[]>([]);
  const pristine = signal<boolean | null>(null);
  const touched = signal<boolean | null>(null);
  const dirty = signal<boolean | null>(null);
  const valid = signal<boolean | null>(null);
  const invalid = signal<boolean | null>(null);
  const pending = signal<boolean | null>(null);
  const disabled = signal<boolean | null>(null);
  // Local variables
  let subscription: Subscription | undefined;

  // Constructor logic
  // any time the ngControl changes, setup the subscriptions.
  onChange(ngControl, setupSubscriptions);

  // Host bindings
  dataBinding(element, 'data-invalid', invalid);
  dataBinding(element, 'data-valid', valid);
  dataBinding(element, 'data-touched', touched);
  dataBinding(element, 'data-pristine', pristine);
  dataBinding(element, 'data-dirty', dirty);
  dataBinding(element, 'data-pending', pending);
  dataBinding(element, 'data-disabled', disabled);

  destroyRef.onDestroy(() => subscription?.unsubscribe());

  // Method implementations
  function setupSubscriptions(control: NgControl | null | undefined): void {
    // Unsubscribe from the previous subscriptions.
    subscription?.unsubscribe();

    // set the initial values
    updateStatus();

    const underlyingControl = control?.control;

    // Listen for changes to the underlying control's status.
    subscription = underlyingControl?.events?.subscribe(updateStatus);
  }
  function updateStatus(): void {
    const control = ngControl();

    if (!control) {
      return;
    }

    pristine.set(control.pristine);
    touched.set(control.touched);
    dirty.set(control.dirty);
    valid.set(control.valid);
    invalid.set(control.invalid);
    pending.set(control.pending);
    disabled.set(control.disabled);
    errors.set(control?.errors ? Object.keys(control.errors) : []);
  }
  function setFormControl(id: string): void {
    formControl.set(id);
  }
  function addLabel(label: string): void {
    labels.update(labels => [...labels, label]);
  }
  function addDescription(description: string): void {
    descriptions.update(descriptions => [...descriptions, description]);
  }
  function removeFormControl(): void {
    formControl.set(null);
  }
  function removeLabel(label: string): void {
    labels.update(labels => labels.filter(l => l !== label));
  }
  function removeDescription(description: string): void {
    descriptions.update(descriptions => descriptions.filter(d => d !== description));
  }

  return {
    pristine,
    touched,
    dirty,
    valid,
    invalid,
    pending,
    disabled,
    errors,
    setFormControl,
    addLabel,
    addDescription,
    removeFormControl,
    removeLabel,
    removeDescription,
  };
}

/**
 * The injection token for the FormField pattern.
 */
export const NgpFormFieldPatternToken = new InjectionToken<NgpFormFieldState>(
  'NgpFormFieldPatternToken',
);

/**
 * Injects the FormField pattern.
 */
export function injectFormFieldPattern(): NgpFormFieldState;
export function injectFormFieldPattern({ optional }: InjectOptions): NgpFormFieldState;
export function injectFormFieldPattern({
  optional,
}: InjectOptions & { optional: true }): NgpFormFieldState | null;
export function injectFormFieldPattern({ optional }: InjectOptions = {}): NgpFormFieldState | null {
  return inject(NgpFormFieldPatternToken, { optional });
}

/**
 * Provides the FormField pattern.
 */
export function provideFormFieldPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpFormFieldState,
): FactoryProvider {
  return { provide: NgpFormFieldPatternToken, useFactory: () => fn(inject(type)) };
}
