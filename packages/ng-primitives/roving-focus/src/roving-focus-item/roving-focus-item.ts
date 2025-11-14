import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input } from '@angular/core';
import {
  ngpRovingFocusItemPattern,
  provideRovingFocusItemPattern,
} from './roving-focus-item-pattern';

/**
 * Apply the `ngpRovingFocusItem` directive to an element within a roving focus group to automatically manage focus.
 */
@Directive({
  selector: '[ngpRovingFocusItem]',
  exportAs: 'ngpRovingFocusItem',
  providers: [provideRovingFocusItemPattern(NgpRovingFocusItem, instance => instance.pattern)],
})
export class NgpRovingFocusItem {
  /**
   * Define if the item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRovingFocusItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpRovingFocusItemPattern({
    disabled: this.disabled,
  });

  /**
   * Focus the roving focus item.
   * @param origin The origin of the focus
   */
  focus(origin: FocusOrigin): void {
    this.pattern.focus(origin);
  }
}
