import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import {
  ngpNavigationMenuContentItem,
  provideNavigationMenuContentItemState,
} from './navigation-menu-content-item-state';

/**
 * The `NgpNavigationMenuContentItem` directive represents an item inside navigation menu content.
 * It participates in roving focus navigation within the content panel.
 */
@Directive({
  selector: '[ngpNavigationMenuContentItem]',
  exportAs: 'ngpNavigationMenuContentItem',
  providers: [provideNavigationMenuContentItemState(), provideRovingFocusItemState()],
})
export class NgpNavigationMenuContentItem {
  /**
   * Whether the item is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNavigationMenuContentItemDisabled',
    transform: booleanAttribute,
  });

  constructor() {
    ngpNavigationMenuContentItem({ disabled: this.disabled });
    ngpRovingFocusItem({ disabled: this.disabled });
  }
}
