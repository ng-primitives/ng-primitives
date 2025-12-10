import { Injector, Signal, effect, inject, signal, untracked } from '@angular/core';
import { NgControl } from '@angular/forms';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { Subscription } from 'rxjs';

/**
 * The state interface for the FormField primitive.
 */
export interface NgpFormFieldState {
  /**
   * The form labels.
   */
  readonly labels: Signal<string[]>;
  /**
   * The form descriptions.
   */
  readonly descriptions: Signal<string[]>;
  /**
   * The id of the associated form control.
   */
  readonly formControl: Signal<string | null>;
  /**
   * The validation error messages.
   */
  readonly errors: Signal<string[]>;
  /**
   * Whether the control is pristine.
   */
  readonly pristine: Signal<boolean | null>;
  /**
   * Whether the control is touched.
   */
  readonly touched: Signal<boolean | null>;
  /**
   * Whether the control is dirty.
   */
  readonly dirty: Signal<boolean | null>;
  /**
   * Whether the control is valid.
   */
  readonly valid: Signal<boolean | null>;
  /**
   * Whether the control is invalid.
   */
  readonly invalid: Signal<boolean | null>;
  /**
   * Whether the control is pending.
   */
  readonly pending: Signal<boolean | null>;
  /**
   * Whether the control is disabled.
   */
  readonly disabled: Signal<boolean | null>;
  /**
   * Register the id of the associated form control.
   */
  setFormControl(id: string): void;
  /**
   * Register a label with the form field.
   */
  addLabel(label: string): void;
  /**
   * Register a description with the form field.
   */
  addDescription(description: string): void;
  /**
   * Remove the associated form control.
   */
  removeFormControl(): void;
  /**
   * Remove a label from the form field.
   */
  removeLabel(label: string): void;
  /**
   * Remove a description from the form field.
   */
  removeDescription(description: string): void;
}

/**
 * The props interface for the FormField primitive.
 */
export interface NgpFormFieldProps {
  /**
   * Find any NgControl within the form field.
   */
  readonly ngControl: Signal<NgControl | undefined>;
}

export const [NgpFormFieldStateToken, ngpFormField, injectFormFieldState, provideFormFieldState] =
  createPrimitive('NgpFormField', ({ ngControl }: NgpFormFieldProps) => {
    const element = injectElementRef();
    const injector = inject(Injector);

    // Store the form labels
    const labels = signal<string[]>([]);

    // Store the form descriptions
    const descriptions = signal<string[]>([]);

    // Store the id of the associated form control
    const formControl = signal<string | null>(null);

    // Store the validation error messages
    const errors = signal<string[]>([]);

    // Form control state signals
    const pristine = signal<boolean | null>(null);
    const touched = signal<boolean | null>(null);
    const dirty = signal<boolean | null>(null);
    const valid = signal<boolean | null>(null);
    const invalid = signal<boolean | null>(null);
    const pending = signal<boolean | null>(null);
    const disabled = signal<boolean | null>(null);

    // Store the current status subscription
    let subscription: Subscription | undefined;

    // Host bindings
    dataBinding(element, 'data-invalid', invalid);
    dataBinding(element, 'data-valid', valid);
    dataBinding(element, 'data-touched', touched);
    dataBinding(element, 'data-pristine', pristine);
    dataBinding(element, 'data-dirty', dirty);
    dataBinding(element, 'data-pending', pending);
    dataBinding(element, 'data-disabled', disabled);

    function updateStatus(): void {
      const control = ngControl();

      if (!control) {
        return;
      }

      // Wrap in try-catch to handle signal-forms interop controls where
      // the `field` input may not be available yet (throws NG0950).
      // Reading the signal still establishes a dependency, so the effect
      // will re-run when the input becomes available.
      try {
        const controlPristine = control.pristine;
        const controlTouched = control.touched;
        const controlDirty = control.dirty;
        const controlValid = control.valid;
        const controlInvalid = control.invalid;
        const controlPending = control.pending;
        const controlDisabled = control.disabled;
        const controlErrors = control.errors;

        untracked(() => {
          pristine.set(controlPristine);
          touched.set(controlTouched);
          dirty.set(controlDirty);
          valid.set(controlValid);
          invalid.set(controlInvalid);
          pending.set(controlPending);
          disabled.set(controlDisabled);
          errors.set(controlErrors ? Object.keys(controlErrors) : []);
        });
      } catch {
        // NG0950: Required input not available yet. The effect will re-run
        // when the signal input becomes available.
      }
    }

    function setupSubscriptions(control: NgControl | null | undefined): void {
      // Unsubscribe from the previous subscriptions.
      subscription?.unsubscribe();

      if (!control) {
        return;
      }

      // For signal-forms interop controls, use an effect to reactively track status.
      // For classic controls, also use an effect but additionally subscribe to events.
      effect(
        () => {
          updateStatus();
        },
        { injector },
      );

      // Classic controls also have an events observable we can subscribe to.
      const underlyingControl = control?.control;
      if (underlyingControl?.events) {
        subscription = underlyingControl.events.subscribe(() => updateStatus());
      }
    }

    // Setup subscriptions when ngControl changes
    onChange(ngControl, setupSubscriptions);

    // Cleanup subscription on destroy
    onDestroy(() => subscription?.unsubscribe());

    // Methods
    function setFormControl(id: string): void {
      formControl.set(id);
    }

    function addLabel(label: string): void {
      if (labels().includes(label)) {
        return;
      }

      labels.update(currentLabels => [...currentLabels, label]);
    }

    function addDescription(description: string): void {
      if (descriptions().includes(description)) {
        return;
      }

      descriptions.update(currentDescriptions => [...currentDescriptions, description]);
    }

    function removeFormControl(): void {
      formControl.set(null);
    }

    function removeLabel(label: string): void {
      labels.update(currentLabels => currentLabels.filter(l => l !== label));
    }

    function removeDescription(description: string): void {
      descriptions.update(currentDescriptions =>
        currentDescriptions.filter(d => d !== description),
      );
    }

    return {
      labels,
      descriptions,
      formControl,
      errors,
      pristine,
      touched,
      dirty,
      valid,
      invalid,
      pending,
      disabled,
      setFormControl,
      addLabel,
      addDescription,
      removeFormControl,
      removeLabel,
      removeDescription,
    };
  });
