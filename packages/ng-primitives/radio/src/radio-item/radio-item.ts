import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  Directive,
  effect,
  input,
  OnInit,
  Signal,
  untracked,
} from '@angular/core';
import {
  injectRovingFocusGroupState,
  ngpRovingFocusItem,
  provideRovingFocusItemState,
} from 'ng-primitives/roving-focus';
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
    const state = ngpRadioItem({
      value: this.value as Signal<T>,
      disabled: this.disabled,
    });
    const rovingItem = ngpRovingFocusItem({ disabled: this.disabled });
    const group = injectRovingFocusGroupState();

    // the checked radio holds the roving tab stop so Tab enters the group on it rather than
    // on the first item - which, because a radio group selects on focus, would otherwise
    // change the value. setTabStop claims it without stealing focus; roving focus takes over
    // on keyboard nav.
    effect(() => {
      const groupState = group();

      if (!groupState || !state.checked() || this.disabled()) {
        return;
      }

      untracked(() => groupState.setTabStop(rovingItem.id()));
    });
  }

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error('The `ngpRadioItem` directive requires a `value` input.');
    }
  }
}
