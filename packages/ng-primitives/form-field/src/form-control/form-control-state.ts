import { Signal, computed, signal } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { NgpControlStatus, controlStatus } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';

interface NgpFormControlProps {
  /**
   * The id of the form control.
   */

  readonly id: Signal<string>;
  /**
   * Whether the form control is disabled by a parent.
   */
  readonly disabled?: Signal<boolean>;
}

export function ngpFormControl({
  id,
  disabled = signal(false),
}: NgpFormControlProps): Signal<NgpControlStatus> {
  const elementRef = injectElementRef();
  // Access the form field that the form control is associated with.
  const formField = injectFormFieldState({ optional: true });
  // Access the form control status.
  const status = controlStatus();
  // Determine the aria-labelledby attribute value.
  const ariaLabelledBy = computed(() => {
    const labels = formField()?.labels() ?? [];
    return labels.length > 0 ? labels.join(' ') : null;
  });
  // Determine the aria-describedby attribute value.
  const ariaDescribedBy = computed(() => {
    const descriptions = formField()?.descriptions() ?? [];
    return descriptions.length > 0 ? descriptions.join(' ') : null;
  });

  const supportsNativeDisable = 'disabled' in elementRef.nativeElement;

  // Host bindings
  attrBinding(elementRef, 'disabled', () => (supportsNativeDisable && disabled() ? '' : null));

  explicitEffect([id], ([id], onCleanup) => {
    formField()?.setFormControl(id);
    onCleanup(() => formField()?.removeFormControl());
  });

  attrBinding(elementRef, 'id', id);
  attrBinding(elementRef, 'aria-labelledby', ariaLabelledBy);
  attrBinding(elementRef, 'aria-describedby', ariaDescribedBy);
  dataBinding(elementRef, 'data-invalid', () => status().invalid);
  dataBinding(elementRef, 'data-valid', () => status().valid);
  dataBinding(elementRef, 'data-touched', () => status().touched);
  dataBinding(elementRef, 'data-pristine', () => status().pristine);
  dataBinding(elementRef, 'data-dirty', () => status().dirty);
  dataBinding(elementRef, 'data-pending', () => status().pending);
  dataBinding(elementRef, 'data-disabled', () => disabled() || status().disabled);

  return computed(() => ({ ...status(), disabled: status().disabled || disabled() }));
}
