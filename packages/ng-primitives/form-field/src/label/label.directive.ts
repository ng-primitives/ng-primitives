/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
  Directive,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormField } from '../form-field/form-field.token';
import { NgpLabelToken } from './label.token';

@Directive({
  standalone: true,
  selector: '[ngpLabel]',
  exportAs: 'ngpLabel',
  providers: [{ provide: NgpLabelToken, useExisting: NgpLabel }],
  host: {
    '[attr.id]': 'id()',
    '[attr.for]': 'htmlFor()',
    '[attr.data-invalid]': 'formField?.invalid()',
    '[attr.data-valid]': 'formField?.valid()',
    '[attr.data-touched]': 'formField?.touched()',
    '[attr.data-pristine]': 'formField?.pristine()',
    '[attr.data-dirty]': 'formField?.dirty()',
    '[attr.data-pending]': 'formField?.pending()',
    '[attr.data-disabled]': 'formField?.disabled()',
  },
})
export class NgpLabel {
  /**
   * Access the element that the label is associated with.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the form field that the label is associated with.
   */
  protected readonly formField = injectFormField();

  /**
   * The id of the label. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-label'));

  /**
   * Determine if the label is an HTML label element.
   */
  protected readonly isLabel = this.elementRef.nativeElement instanceof HTMLLabelElement;

  /**
   * Derive the for attribute value if the label is an HTML label element.
   */
  protected readonly htmlFor = computed(() => this.formField?.formControl());

  constructor() {
    effect(
      onCleanup => {
        this.formField?.addLabel(this.id());
        onCleanup(() => this.formField?.removeLabel(this.id()));
      },
      { allowSignalWrites: true },
    );
  }

  @HostListener('click', ['$event'])
  protected onClick(event: MouseEvent): void {
    // by default a label will perform a click on the associated form control, however
    // this only works if the associated form control is an input element which may not always
    // be the case, so we prevent the default behavior and handle the click event ourselves.
    // This was inspired by the HeadlessUI approach:
    // https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/components/label/label.tsx#L58
    if (this.isLabel) {
      event.preventDefault();
    }

    // to find the associated form control we can lookup via the known id
    const targetId = this.htmlFor();

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
}
