import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from './roving-focus-item-state';

/**
 * Apply the `ngpRovingFocusItem` directive to an element within a roving focus group to automatically manage focus.
 */
@Directive({
  selector: '[ngpRovingFocusItem]',
  exportAs: 'ngpRovingFocusItem',
  providers: [provideRovingFocusItemState()],
})
export class NgpRovingFocusItem {
  /**
   * Define if the item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRovingFocusItemDisabled',
    transform: booleanAttribute,
  });

  private readonly state = ngpRovingFocusItem({ disabled: this.disabled });

  /**
   * Expose the internal id of the roving focus item.
   * @internal
   */
  readonly id = computed(() => this.state.id());
}
