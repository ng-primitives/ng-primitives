/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, computed, effect, inject, input } from '@angular/core';
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
  protected readonly htmlFor = computed(() =>
    this.isLabel ? this.formField?.formControl() : null,
  );

  constructor() {
    effect(
      onCleanup => {
        this.formField?.addLabel(this.id());
        onCleanup(() => this.formField?.removeLabel(this.id()));
      },
      { allowSignalWrites: true },
    );
  }
}
