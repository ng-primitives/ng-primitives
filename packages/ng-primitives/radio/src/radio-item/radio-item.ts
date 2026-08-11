import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnInit, Signal } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { ngpRadioItem, provideRadioItemState } from './radio-item-state';

/**
 * Apply the `ngpRadioItem` directive to an element that represents a radio item. This would typically be a `button` element.
 */
@Directive({
  selector: '[ngpRadioItem]',
  providers: [provideRadioItemState(), provideRovingFocusItemState()],
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

  constructor() {
    ngpRadioItem({
      value: this.value as Signal<T>,
      disabled: this.disabled,
    });
    ngpRovingFocusItem({ disabled: this.disabled });
  }

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error('The `ngpRadioItem` directive requires a `value` input.');
    }
  }
}
