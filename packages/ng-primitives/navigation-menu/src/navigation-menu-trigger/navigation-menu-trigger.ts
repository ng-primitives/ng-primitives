import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpRovingFocusItem, provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import {
  ngpNavigationMenuTrigger,
  provideNavigationMenuTriggerState,
} from './navigation-menu-trigger-state';

/**
 * Apply the `ngpNavigationMenuTrigger` directive to a button that toggles content display.
 */
@Directive({
  selector: '[ngpNavigationMenuTrigger]',
  exportAs: 'ngpNavigationMenuTrigger',
  providers: [
    provideNavigationMenuTriggerState({ inherit: false }),
    provideRovingFocusItemState({ inherit: false }),
  ],
})
export class NgpNavigationMenuTrigger {
  /**
   * Whether the trigger is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpNavigationMenuTriggerDisabled',
    transform: booleanAttribute,
  });

  private readonly state = ngpNavigationMenuTrigger({
    disabled: this.disabled,
  });

  constructor() {
    // Set up roving focus
    ngpRovingFocusItem({
      disabled: this.disabled,
    });
  }

  /**
   * Whether the trigger's content is open.
   */
  readonly open = this.state.open;

  /**
   * Toggle the content visibility.
   */
  toggle(): void {
    this.state.toggle();
  }
}
