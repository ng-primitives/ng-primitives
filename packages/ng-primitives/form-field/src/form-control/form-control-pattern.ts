import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { controlStatus, uniqueId } from 'ng-primitives/utils';
import { injectFormFieldPattern } from '../form-field/form-field-pattern';

/**
 * The state interface for the FormControl pattern.
 */
export interface NgpFormControlState {
  // Define state properties and methods
  readonly pristine: Signal<boolean | null>;
  readonly touched: Signal<boolean | null>;
  readonly dirty: Signal<boolean | null>;
  readonly valid: Signal<boolean | null>;
  readonly invalid: Signal<boolean | null>;
  readonly pending: Signal<boolean | null>;
  readonly disabled: Signal<boolean | null>;
}

/**
 * The props interface for the FormControl pattern.
 */
export interface NgpFormControlProps {
  /**
   * The element reference for the form-control.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
  /**
   * Disabled signal input.
   */
  readonly disabled?: Signal<boolean>;
}

/**
 * The FormControl pattern function.
 */
export function ngpFormControlPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-form-control')),
  disabled = signal(false),
}: NgpFormControlProps = {}): NgpFormControlState {
  // Properties and computed values
  const supportsDisabledAttribute = 'disabled' in element.nativeElement;

  // Constructor logic
  // Sync the form control state with the control state.
  // Access the form field that the form control is associated with.
  const formField = injectFormFieldPattern({ optional: true });
  // Access the form control status.
  const status = controlStatus();
  // Determine the aria-labelledby attribute value.
  const ariaLabelledBy = computed(() => formField?.labels().join(' ') ?? null);
  // Determine the aria-describedby attribute value.
  const ariaDescribedBy = computed(() => formField?.descriptions().join(' ') ?? null);

  explicitEffect([id], ([id], onCleanup) => {
    formField?.setFormControl(id);
    onCleanup(() => formField?.removeFormControl());
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

  // Host bindings
  attrBinding(
    element,
    'disabled',
    computed(() => supportsDisabledAttribute && (disabled() || status().disabled)),
  );

  return {
    pristine: computed(() => status().pristine),
    touched: computed(() => status().touched),
    dirty: computed(() => status().dirty),
    valid: computed(() => status().valid),
    invalid: computed(() => status().invalid),
    pending: computed(() => status().pending),
    disabled: computed(() => disabled() || status().disabled),
  };
}

/**
 * The injection token for the FormControl pattern.
 */
export const NgpFormControlPatternToken = new InjectionToken<NgpFormControlState>(
  'NgpFormControlPatternToken',
);

/**
 * Injects the FormControl pattern.
 */
export function injectFormControlPattern(): NgpFormControlState {
  return inject(NgpFormControlPatternToken);
}

/**
 * Provides the FormControl pattern.
 */
export function provideFormControlPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpFormControlState,
): FactoryProvider {
  return { provide: NgpFormControlPatternToken, useFactory: () => fn(inject(type)) };
}
