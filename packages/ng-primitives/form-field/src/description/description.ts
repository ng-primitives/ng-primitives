import { Directive, effect, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectFormFieldState } from '../form-field/form-field-state';
import { ngpDescriptionPattern, provideDescriptionPattern } from './description-pattern';

/**
 * The `NgpDescription` directive is used to mark a description element within a form field. There may be multiple descriptions associated with a form control.
 */
@Directive({
  selector: '[ngpDescription]',
  exportAs: 'ngpDescription',
  host: {
    '[attr.id]': 'id()',
    '[attr.data-invalid]': 'formField()?.invalid() ? "" : null',
    '[attr.data-valid]': 'formField()?.valid() ? "" : null',
    '[attr.data-touched]': 'formField()?.touched() ? "" : null',
    '[attr.data-pristine]': 'formField()?.pristine() ? "" : null',
    '[attr.data-dirty]': 'formField()?.dirty() ? "" : null',
    '[attr.data-pending]': 'formField()?.pending() ? "" : null',
    '[attr.data-disabled]': 'formField()?.disabled() ? "" : null',
  },
  providers: [provideDescriptionPattern(NgpDescription, instance => instance.pattern)],
})
export class NgpDescription {
  /**
   * The id of the description. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-description'));

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpDescriptionPattern({
    id: this.id,
  });

  /**
   * Access the form field that the description is associated with.
   */
  protected readonly formField = injectFormFieldState({ optional: true });

  constructor() {
    effect(onCleanup => {
      this.formField()?.addDescription(this.id());
      onCleanup(() => this.formField()?.removeDescription(this.id()));
    });
  }
}
