import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpButtonPattern, provideButtonPattern } from './button-pattern';

@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonPattern(NgpButton, instance => instance.pattern)],
})
export class NgpButton {
  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The button pattern.
   */
  readonly pattern = ngpButtonPattern({
    disabled: this.disabled,
  });
}
