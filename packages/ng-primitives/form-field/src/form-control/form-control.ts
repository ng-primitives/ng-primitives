import { BooleanInput } from '@angular/cdk/coercion';
import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  Directive,
  input,
  signal,
  Signal,
} from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';
import { formControlState, provideFormControlState } from './form-control-state';

/**
 * Typically this primitive would be not be used directly, but instead a more specific form control primitive would be used (e.g. `ngpInput`). All of our form control primitives use `ngpFormControl` internally so they will have the same accessibility features as described below.
 *
 * The `NgpFormControl` directive is used to mark a form control element within a form field. This element will have an `aria-labelledby` attribute set to the ID of the label element within the form field and an `aria-describedby` attribute set to the ID of the description elements within the form field.
 */
@Directive({
  selector: '[ngpFormControl]',
  exportAs: 'ngpFormControl',
  providers: [provideFormControlState()],
})
export class NgpFormControl {
  /**
   * The id of the form control. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-form-control'));

  /**
   * Whether the form control is disabled by a parent.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFormControlDisabled',
    transform: booleanAttribute,
  });

  /**
   * The state of the form control.
   */
  private readonly state = formControlState<NgpFormControl>(this);

  constructor() {
    // Sync the form control state with the control state.
    setupFormControl({ id: this.state.id, disabled: this.state.disabled });
  }
}

interface FormControlState {
  id?: Signal<string>;
  disabled?: Signal<boolean>;
}

export function setupFormControl({
  id = signal(uniqueId('ngp-form-control')),
  disabled = signal(false),
}: FormControlState) {
  const element = injectElementRef().nativeElement;
  // Access the form field that the form control is associated with.
  const formField = injectFormFieldState({ optional: true });
  // Determine the aria-labelledby attribute value.
  const ariaLabelledBy = computed(() => formField()?.labels().join(' '));
  // Determine the aria-describedby attribute value.
  const ariaDescribedBy = computed(() => formField()?.descriptions().join(' '));

  explicitEffect([id], ([id], onCleanup) => {
    formField()?.setFormControl(id);
    onCleanup(() => formField()?.removeFormControl());
  });

  afterRenderEffect({
    write: () => {
      element.setAttribute('id', id());
      element.setAttribute('aria-labelledby', ariaLabelledBy());
      element.setAttribute('aria-describedby', ariaDescribedBy());

      setStateAttribute(element, formField()?.invalid(), 'data-invalid');
      setStateAttribute(element, formField()?.valid(), 'data-valid');
      setStateAttribute(element, formField()?.touched(), 'data-touched');
      setStateAttribute(element, formField()?.pristine(), 'data-pristine');
      setStateAttribute(element, formField()?.dirty(), 'data-dirty');
      setStateAttribute(element, formField()?.pending(), 'data-pending');
      setStateAttribute(element, disabled() || formField()?.disabled(), 'data-disabled');
    },
  });
}

/**
 * Sets the attribute on the element based on the state. If the state is true, the attribute
 * is set to an empty string. If the state is false, the attribute is removed.
 * @param element The element to set the attribute on.
 * @param state The state to set the attribute based on.
 * @param attribute The attribute to set on the element.
 */
function setStateAttribute(element: HTMLElement, state: boolean | null, attribute: string) {
  if (state) {
    element.setAttribute(attribute, '');
  } else {
    element.removeAttribute(attribute);
  }
}
