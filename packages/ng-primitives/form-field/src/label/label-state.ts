import { Signal, computed } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';

/**
 * The state interface for the Label primitive.
 */
export interface NgpLabelState {
  /**
   * The id of the label.
   */
  readonly id: Signal<string>;
  /**
   * The htmlFor attribute value.
   */
  readonly htmlFor: Signal<string | null>;
}

/**
 * The props interface for the Label primitive.
 */
export interface NgpLabelProps {
  /**
   * The id of the label.
   */
  readonly id: Signal<string>;
}

export const [NgpLabelStateToken, ngpLabel, injectLabelState, provideLabelState] = createPrimitive(
  'NgpLabel',
  ({ id }: NgpLabelProps) => {
    const element = injectElementRef();
    const formField = injectFormFieldState({ optional: true });

    // Derive the for attribute value if the label is an HTML label element
    const htmlFor = computed(() => formField()?.formControl() ?? null);

    // Determine if the label is an HTML label element
    const isLabel = element.nativeElement instanceof HTMLLabelElement;

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'for', htmlFor);
    dataBinding(element, 'data-invalid', () => (formField()?.invalid() ? '' : null));
    dataBinding(element, 'data-valid', () => (formField()?.valid() ? '' : null));
    dataBinding(element, 'data-touched', () => (formField()?.touched() ? '' : null));
    dataBinding(element, 'data-pristine', () => (formField()?.pristine() ? '' : null));
    dataBinding(element, 'data-dirty', () => (formField()?.dirty() ? '' : null));
    dataBinding(element, 'data-pending', () => (formField()?.pending() ? '' : null));
    dataBinding(element, 'data-disabled', () => (formField()?.disabled() ? '' : null));

    function onClick(event: MouseEvent): void {
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

    // Event listeners
    listener(element, 'click', onClick);

    // Register with form field and cleanup on destroy
    formField()?.addLabel(id());
    onDestroy(() => formField()?.removeLabel(id()));

    // any time the id changes we need to update the registration with the form field
    onChange(id, (newId, oldId) => {
      if (oldId) {
        formField()?.removeLabel(oldId);
      }
      formField()?.addLabel(newId);
    });

    return {
      id,
      htmlFor,
    } satisfies NgpLabelState;
  },
);
