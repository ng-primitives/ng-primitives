import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, signal } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { coerceOffset, coerceShift, NgpOffset, NgpOffsetInput, NgpShift, NgpShiftInput } from 'ng-primitives/portal';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import {
  ngpNavigationMenuContent,
  provideNavigationMenuContentState,
} from './navigation-menu-content-state';

/**
 * Apply the `ngpNavigationMenuContent` directive to the content panel for each trigger.
 */
@Directive({
  selector: '[ngpNavigationMenuContent]',
  exportAs: 'ngpNavigationMenuContent',
  providers: [
    provideNavigationMenuContentState({ inherit: false }),
    provideRovingFocusGroupState({ inherit: false }),
  ],
  host: {
    role: 'menu',
  },
})
export class NgpNavigationMenuContent {
  /**
   * The placement of the content.
   * @default 'bottom'
   */
  readonly placement = input<Placement>('bottom', {
    alias: 'ngpNavigationMenuContentPlacement',
  });

  /**
   * The offset of the content from the trigger.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(0, {
    alias: 'ngpNavigationMenuContentOffset',
    transform: coerceOffset,
  });

  /**
   * Whether the content should flip when there is not enough space.
   * @default true
   */
  readonly flip = input<boolean, BooleanInput>(true, {
    alias: 'ngpNavigationMenuContentFlip',
    transform: booleanAttribute,
  });

  /**
   * Configure shift behavior to keep the content in view.
   * @default true
   */
  readonly shift = input<NgpShift, NgpShiftInput>(true, {
    alias: 'ngpNavigationMenuContentShift',
    transform: coerceShift,
  });

  private readonly state = ngpNavigationMenuContent({
    placement: this.placement,
    offset: this.offset,
    flip: this.flip,
    shift: this.shift,
  });

  constructor() {
    // Set up roving focus group for keyboard navigation within the content
    // inherit: false - create our own group, don't use the root menu's group
    // wrap: false - ArrowUp on first item should not wrap to last
    ngpRovingFocusGroup({
      orientation: signal('vertical'),
      disabled: signal(false),
      wrap: signal(false),
      homeEnd: signal(true),
      inherit: false,
    });
  }

  /**
   * Whether the content is open.
   */
  readonly open = this.state.open;

  /**
   * The motion direction for animations.
   */
  readonly motionDirection = this.state.motionDirection;
}
