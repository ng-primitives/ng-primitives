import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, signal } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import {
  ngpNavigationMenuLink,
  provideNavigationMenuLinkState,
} from './navigation-menu-link-state';

/**
 * Apply the `ngpNavigationMenuLink` directive to navigation links within the menu.
 */
@Directive({
  selector: '[ngpNavigationMenuLink]',
  exportAs: 'ngpNavigationMenuLink',
  providers: [
    provideNavigationMenuLinkState({ inherit: false }),
    provideRovingFocusItemState({ inherit: false }),
  ],
  host: {
    role: 'menuitem',
  },
})
export class NgpNavigationMenuLink {
  /**
   * Whether the link is the current active page.
   * @default false
   */
  readonly active = input<boolean, BooleanInput>(false, {
    alias: 'ngpNavigationMenuLinkActive',
    transform: booleanAttribute,
  });

  private readonly state = ngpNavigationMenuLink({
    active: this.active,
  });

  constructor() {
    // Set up roving focus for keyboard navigation
    ngpRovingFocusItem({
      disabled: signal(false),
    });
  }

  /**
   * Event emitted when the link is selected.
   */
  readonly select = outputFromObservable(this.state.select.asObservable(), {
    alias: 'ngpNavigationMenuLinkSelect',
  });
}
