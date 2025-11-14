import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnInit, Signal } from '@angular/core';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import {
  ngpToggleGroupItemPattern,
  provideToggleGroupItemPattern,
} from './toggle-group-item-pattern';

@Directive({
  selector: '[ngpToggleGroupItem]',
  exportAs: 'ngpToggleGroupItem',
  providers: [provideToggleGroupItemPattern(NgpToggleGroupItem, instance => instance.pattern)],
  hostDirectives: [
    {
      directive: NgpRovingFocusItem,
      inputs: ['ngpRovingFocusItemDisabled: ngpToggleGroupItemDisabled'],
    },
  ],
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

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpToggleGroupItemPattern({
    value: this.value as unknown as Signal<string>,
    disabled: this.disabled,
  });

  ngOnInit(): void {
    // we can't use a required input for value as it is used in a computed property before the input is set
    if (this.value() === undefined) {
      throw new Error('The value input is required for the toggle group item.');
    }
  }

  /**
   * Toggle the item.
   */
  protected toggle(): void {
    this.pattern.toggle();
  }
}
