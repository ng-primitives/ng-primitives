import {
  computed,
  effect,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, onClick } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormFieldPattern } from '../form-field/form-field-pattern';

/**
 * The state interface for the Label pattern.
 */
export interface NgpLabelState {
  // Define state properties and methods
}

/**
 * The props interface for the Label pattern.
 */
export interface NgpLabelProps {
  /**
   * The element reference for the label.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
}

/**
 * The Label pattern function.
 */
export function ngpLabelPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-label')),
}: NgpLabelProps = {}): NgpLabelState {
  // Dependency injection
  const formField = injectFormFieldPattern({ optional: true });

  // Properties and computed values
  const htmlFor = computed(() => formField?.formControl());
  const isLabel = element.nativeElement instanceof HTMLLabelElement;

  // Constructor logic
  effect(onCleanup => {
    formField?.addLabel(id());
    onCleanup(() => formField?.removeLabel(id()));
  });

  // Host bindings
  attrBinding(element, 'id', id);
  attrBinding(element, 'for', htmlFor);
  dataBinding(
    element,
    'data-invalid',
    computed(() => formField?.invalid() ?? false),
  );
  dataBinding(
    element,
    'data-valid',
    computed(() => formField?.valid() ?? false),
  );
  dataBinding(
    element,
    'data-touched',
    computed(() => formField?.touched() ?? false),
  );
  dataBinding(
    element,
    'data-pristine',
    computed(() => formField?.pristine() ?? false),
  );
  dataBinding(
    element,
    'data-dirty',
    computed(() => formField?.dirty() ?? false),
  );
  dataBinding(
    element,
    'data-pending',
    computed(() => formField?.pending() ?? false),
  );
  dataBinding(
    element,
    'data-disabled',
    computed(() => formField?.disabled() ?? false),
  );
  onClick(element, preventDefaultBehavior);

  // Method implementations
  function preventDefaultBehavior(event: MouseEvent): void {
    // by default a label will perform a click on the associated form control, however
    // this only works if the associated form control is an input element which may not always
    // be the case, so we prevent the default behavior and handle the click event ourselves.
    // This was inspired by the HeadlessUI approach:
    // https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/components/label/label.tsx#L58
    if (isLabel) {
      event.preventDefault();
    }

    // to find the associated form control we can lookup via the known id
    const targetId = htmlFor();

    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    // if the target is disabled then do nothing
    const disabled = target.getAttribute('disabled');
    const ariaDisabled = target.getAttribute('aria-disabled');

    if (disabled === '' || disabled === 'true' || ariaDisabled === 'true') {
      return;
    }

    // radio buttons, checkboxes and switches should all be clicked immediately as they require state changes
    if (
      (target instanceof HTMLInputElement &&
        (target.type === 'radio' || target.type === 'checkbox')) ||
      target.role === 'radio' ||
      target.role === 'checkbox' ||
      target.role === 'switch'
    ) {
      target.click();
    }

    // Move focus to the element, this allows you to start using keyboard shortcuts since the
    // bound element is now focused.
    target.focus({ preventScroll: true });
  }

  return {
    // Return state object
  };
}

/**
 * The injection token for the Label pattern.
 */
export const NgpLabelPatternToken = new InjectionToken<NgpLabelState>('NgpLabelPatternToken');

/**
 * Injects the Label pattern.
 */
export function injectLabelPattern(): NgpLabelState {
  return inject(NgpLabelPatternToken);
}

/**
 * Provides the Label pattern.
 */
export function provideLabelPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpLabelState,
): FactoryProvider {
  return { provide: NgpLabelPatternToken, useFactory: () => fn(inject(type)) };
}
