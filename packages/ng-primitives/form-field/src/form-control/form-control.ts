import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  input,
  signal,
  Signal,
} from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { controlStatus, NgpControlStatus, uniqueId } from 'ng-primitives/utils';
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
  host: {
    '[attr.disabled]': 'supportsDisabledAttribute && status().disabled ? "" : null',
  },
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
   * The status of the form control.
   */
  readonly status: Signal<NgpControlStatus>;

  /**
   * The element reference.
   */
  private readonly elementRef = injectElementRef();

  /**
   * Whether the element supports the disabled attribute.
   */
  protected readonly supportsDisabledAttribute = 'disabled' in this.elementRef.nativeElement;

  /**
   * The state of the form control.
   */
  private readonly state = formControlState<NgpFormControl>(this);

  constructor() {
    // Sync the form control state with the control state.
    this.status = setupFormControl({ id: this.state.id, disabled: this.state.disabled });
  }
}

interface FormControlProps {
  id: Signal<string>;
  disabled?: Signal<boolean>;
  element?: ElementRef<HTMLElement>;
}

export function setupFormControl({
  id,
  disabled = signal(false),
  element = injectElementRef(),
}: FormControlProps): Signal<NgpControlStatus> {
  // Access the form field that the form control is associated with.
  const formField = injectFormFieldState({ optional: true });
  // Access the form control status.
  const status = controlStatus();
  // Determine the aria-labelledby attribute value.
  const ariaLabelledBy = computed(() => formField()?.labels().join(' '));
  // Determine the aria-describedby attribute value.
  const ariaDescribedBy = computed(() => formField()?.descriptions().join(' '));

  explicitEffect([id], ([id], onCleanup) => {
    formField()?.setFormControl(id);
    onCleanup(() => formField()?.removeFormControl());
  });

  attrBinding(element, 'id', id);
  attrBinding(element, 'aria-labelledby', ariaLabelledBy);
  attrBinding(element, 'aria-describedby', ariaDescribedBy);

  dataBinding(
    element,
    'data-invalid',
    computed(() => status().invalid),
  );
  dataBinding(
    element,
    'data-valid',
    computed(() => status().valid),
  );
  dataBinding(
    element,
    'data-touched',
    computed(() => status().touched),
  );
  dataBinding(
    element,
    'data-untouched',
    computed(() => !status().touched),
  );
  dataBinding(
    element,
    'data-dirty',
    computed(() => status().dirty),
  );
  dataBinding(
    element,
    'data-pristine',
    computed(() => !status().dirty),
  );
  dataBinding(
    element,
    'data-pending',
    computed(() => status().pending),
  );
  dataBinding(
    element,
    'data-disabled',
    computed(() => disabled() || status().disabled),
  );

  return computed(() => ({ ...status(), disabled: status().disabled || disabled() }));
}
