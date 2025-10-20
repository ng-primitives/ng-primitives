import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import {
  ngpRovingFocusGroupPattern,
  provideRovingFocusGroupPattern,
} from './roving-focus-group-pattern';
import { provideRovingFocusGroup } from './roving-focus-group-token';

/**
 * Apply the `ngpRovingFocusGroup` directive to an element to manage focus for a group of child elements.
 */
@Directive({
  selector: '[ngpRovingFocusGroup]',
  exportAs: 'ngpRovingFocusGroup',
  providers: [
    provideRovingFocusGroupPattern(NgpRovingFocusGroup, instance => instance.pattern),
    provideRovingFocusGroup(NgpRovingFocusGroup),
  ],
})
export class NgpRovingFocusGroup {
  /**
   * Store the active item id in the roving focus group.
   * @internal
   */
  readonly activeItem = signal<string | null>(null);

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
   * The pattern instance.
   */
  protected readonly pattern = ngpRovingFocusGroupPattern({
    orientation: this.orientation,
    wrap: this.wrap,
    homeEnd: this.homeEnd,
    disabled: this.disabled,
  });

  /**
   * Activate an item in the roving focus group.
   * @param id The item to activate
   * @param origin The origin of the focus change
   */
  setActiveItem(id: string | null, origin: FocusOrigin = 'program'): void {
    this.pattern.setActiveItem(id, origin);
  }
}
