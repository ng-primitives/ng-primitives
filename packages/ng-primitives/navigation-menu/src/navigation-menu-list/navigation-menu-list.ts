import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { injectNavigationMenuConfig } from '../config/navigation-menu-config';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';
import {
  ngpNavigationMenuList,
  provideNavigationMenuListState,
} from './navigation-menu-list-state';

/**
 * The `NgpNavigationMenuList` directive is a container for navigation menu items.
 * It manages roving focus between menu triggers and links.
 */
@Directive({
  selector: '[ngpNavigationMenuList]',
  exportAs: 'ngpNavigationMenuList',
  providers: [provideNavigationMenuListState(), provideRovingFocusGroupState({ inherit: false })],
})
export class NgpNavigationMenuList {
  /**
   * Access the global navigation menu configuration.
   */
  private readonly config = injectNavigationMenuConfig();

  /**
   * Access the parent navigation menu state.
   */
  private readonly navigationMenuState = injectNavigationMenuState();

  /**
   * Whether focus should wrap around when reaching the end of the list.
   * @default true
   */
  readonly wrap = input<boolean, BooleanInput>(this.config.wrap, {
    alias: 'ngpNavigationMenuListWrap',
    transform: booleanAttribute,
  });

  constructor() {
    ngpNavigationMenuList({});
    ngpRovingFocusGroup({
      orientation: this.navigationMenuState().orientation,
      wrap: this.wrap,
    });
  }
}
