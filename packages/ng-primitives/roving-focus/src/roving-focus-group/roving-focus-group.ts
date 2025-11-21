import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpRovingFocusItem } from '../roving-focus-item/roving-focus-item';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from './roving-focus-group-state';
import { provideRovingFocusGroup } from './roving-focus-group-token';

/**
 * Apply the `ngpRovingFocusGroup` directive to an element to manage focus for a group of child elements.
 */
@Directive({
  selector: '[ngpRovingFocusGroup]',
  exportAs: 'ngpRovingFocusGroup',
  providers: [provideRovingFocusGroup(NgpRovingFocusGroup), provideRovingFocusGroupState()],
})
export class NgpRovingFocusGroup {
  /**
   * Determine the orientation of the roving focus group.
   * @default 'vertical'
   */
  readonly orientation = input<NgpOrientation>('vertical', {
    alias: 'ngpRovingFocusGroupOrientation',
  });

  /**
   * Determine if focus should wrap when the end or beginning is reached.
   */
  readonly wrap = input<boolean, BooleanInput>(true, {
    alias: 'ngpRovingFocusGroupWrap',
    transform: booleanAttribute,
  });

  /**
   * Determine if the home and end keys should navigate to the first and last items.
   */
  readonly homeEnd = input<boolean, BooleanInput>(true, {
    alias: 'ngpRovingFocusGroupHomeEnd',
    transform: booleanAttribute,
  });

  /**
   * Determine if the roving focus group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRovingFocusGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * Store the active item in the roving focus group.
   * @internal
   */
  readonly activeItem = signal<NgpRovingFocusItem | null>(null);

  /**
   * The state of the roving focus group.
   */
  readonly state = ngpRovingFocusGroup({
    orientation: this.orientation,
    wrap: this.wrap,
    homeEnd: this.homeEnd,
    disabled: this.disabled,
  });

  /**
   * Activate an item in the roving focus group.
   * @param item The item to activate
   * @param origin The origin of the focus change
   */
  setActiveItem(item: NgpRovingFocusItem | null, origin: FocusOrigin = 'program'): void {
    if (item) {
      this.state.setActiveItem(item.id(), origin);
    }
  }
}
