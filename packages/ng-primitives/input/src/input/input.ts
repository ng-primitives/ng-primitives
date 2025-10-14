import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpInputPattern, provideInputPattern } from './input-pattern';

@Directive({
  selector: 'input[ngpInput]',
  exportAs: 'ngpInput',
  providers: [provideInputPattern(NgpInput, instance => instance.pattern)],
})
export class NgpInput {
  /**
   * The id of the input.
   */
  readonly id = input(uniqueId('ngp-input'));

  /**
   * Whether the element is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  protected readonly pattern = ngpInputPattern({
    id: this.id,
    disabled: this.disabled,
  });
}
