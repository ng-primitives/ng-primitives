import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnInit, Signal } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { ngpToggleGroupItem, provideToggleGroupItemState } from './toggle-group-item-state';

@Directive({
  selector: '[ngpToggleGroupItem]',
  exportAs: 'ngpToggleGroupItem',
  providers: [provideToggleGroupItemState(), provideRovingFocusItemState()],
})
export class NgpToggleGroupItem implements OnInit {
  /**
   * The value of the item.
   * @required
   */
  readonly value = input<string>(undefined, {
    alias: 'ngpToggleGroupItemValue',
  });

  /**
   * Whether the item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleGroupItemDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    ngpToggleGroupItem({
      value: this.value as Signal<string>,
      disabled: this.disabled,
    });
    // Initialize the roving focus item state
    ngpRovingFocusItem({ disabled: this.disabled });
  }

  ngOnInit(): void {
    // we can't use a required input for value as it is used in a computed property before the input is set
    if (this.value() === undefined) {
      throw new Error('The value input is required for the toggle group item.');
    }
  }
}
