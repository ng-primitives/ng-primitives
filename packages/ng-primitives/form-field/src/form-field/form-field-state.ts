import { Signal, computed, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding } from 'ng-primitives/state';
import { controlStatus, FormFieldSource } from 'ng-primitives/utils';

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
  /**
   * The form control associated with the form field, used when the control is not
   * located within the form field's own DOM.
   *
   * Accepts either a Reactive Forms `AbstractControl`, typically bound with
   * `[formControl]`, or a Signal Forms `FieldTree`, typically bound with `[formField]`.
   *
   * When omitted, the form field automatically looks up the `NgControl` contained
   * within its own DOM. This input is only necessary when the control lives outside
   * the form field.
   */
  readonly formFieldSource: Signal<FormFieldSource | undefined>;
}

export const [NgpFormFieldStateToken, ngpFormField, injectFormFieldState, provideFormFieldState] =
  createPrimitive('NgpFormField', ({ ngControl, formFieldSource }: NgpFormFieldProps) => {
    const element = injectElementRef();

    // Access the form control status.
    const status = controlStatus({
      source: formFieldSource,
      control: ngControl,
    });

    // Store the form labels
    const labels = signal<string[]>([]);

    // Store the form descriptions
    const descriptions = signal<string[]>([]);

    // Store the id of the associated form control
    const formControl = signal<string | null>(null);

    // Store the validation error messages
    const errors = computed<string[]>(() => status().errors ?? []);

    // Form control state signals
    const pristine = computed<boolean | null>(() => status().pristine);
    const touched = computed<boolean | null>(() => status().touched);
    const dirty = computed<boolean | null>(() => status().dirty);
    const valid = computed<boolean | null>(() => status().valid);
    const invalid = computed<boolean | null>(() => status().invalid);
    const pending = computed<boolean | null>(() => status().pending);
    const disabled = computed<boolean | null>(() => status().disabled);

    // Host bindings
    dataBinding(element, 'data-invalid', invalid);
    dataBinding(element, 'data-valid', valid);
    dataBinding(element, 'data-touched', touched);
    dataBinding(element, 'data-pristine', pristine);
    dataBinding(element, 'data-dirty', dirty);
    dataBinding(element, 'data-pending', pending);
    dataBinding(element, 'data-disabled', disabled);

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
    } satisfies NgpFormFieldState;
  });
