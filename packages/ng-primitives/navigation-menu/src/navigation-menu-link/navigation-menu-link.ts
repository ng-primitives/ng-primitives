import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import {
  ngpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from './navigation-menu-link-state';

/**
 * The `NgpNavigationMenuLink` directive is used for standalone navigation links
 * within the navigation menu list (links without dropdown content).
 */
@Directive({
  selector: '[ngpNavigationMenuLink]',
  exportAs: 'ngpNavigationMenuLink',
  providers: [provideNavigationMenuLinkState(), provideRovingFocusItemState()],
})
export class NgpNavigationMenuLink {
  /**
   * Whether the link is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNavigationMenuLinkDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the link is active (represents the current page).
   * @default false
   */
  readonly active = input<boolean, BooleanInput>(false, {
    alias: 'ngpNavigationMenuLinkActive',
    transform: booleanAttribute,
  });

  private readonly state = ngpNavigationMenuLink({
    disabled: this.disabled,
    active: this.active,
  });

  constructor() {
    ngpRovingFocusItem({
      disabled: this.disabled,
    });
  }
}
