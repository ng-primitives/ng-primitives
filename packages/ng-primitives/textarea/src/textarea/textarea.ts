import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpTextareaPattern, provideTextareaPattern } from './textarea-pattern';

@Directive({
  selector: '[ngpTextarea]',
  exportAs: 'ngpTextarea',
  providers: [provideTextareaPattern(NgpTextarea, instance => instance.pattern)],
})
export class NgpTextarea {
  /**
   * The id of the textarea. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-textarea'));

  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  // Initialize the pattern with directive properties, using the computed disabled status
  protected readonly pattern = ngpTextareaPattern({
    id: this.id,
    disabled: this.disabled,
  });
}
