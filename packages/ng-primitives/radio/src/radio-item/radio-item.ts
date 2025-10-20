import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, OnInit, booleanAttribute, input } from '@angular/core';
import { ngpRadioItemPattern, provideRadioItemPattern } from './radio-item-pattern';

/**
 * Apply the `ngpRadioItem` directive to an element that represents a radio item. This would typically be a `button` element.
 */
@Directive({
  selector: '[ngpRadioItem]',
  providers: [provideRadioItemPattern(NgpRadioItem, instance => instance.pattern)],
})
export class NgpRadioItem<T> implements OnInit {
  /**
   * The value of the radio item.
   * @required
   */
  readonly value = input<T>(undefined, { alias: 'ngpRadioItemValue' });

  /**
   * Whether the radio item is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRadioItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpRadioItemPattern({
    value: this.value,
    disabled: this.disabled,
  });

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error('The `ngpRadioItem` directive requires a `value` input.');
    }
  }
}
