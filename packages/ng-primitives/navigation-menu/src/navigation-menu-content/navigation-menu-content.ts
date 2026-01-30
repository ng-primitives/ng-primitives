import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { injectNavigationMenuConfig } from '../config/navigation-menu-config';
import {
  ngpNavigationMenuContent,
  provideNavigationMenuContentState,
} from './navigation-menu-content-state';

/**
 * The `NgpNavigationMenuContent` directive is the content panel displayed when a trigger is activated.
 * It has its own roving focus group for keyboard navigation within the content.
 */
@Directive({
  selector: '[ngpNavigationMenuContent]',
  exportAs: 'ngpNavigationMenuContent',
  providers: [
    provideNavigationMenuContentState(),
    provideRovingFocusGroupState({ inherit: false }),
  ],
  host: {
    'data-overlay': '',
  },
})
export class NgpNavigationMenuContent {
  /**
   * Access the global navigation menu configuration.
   */
  private readonly config = injectNavigationMenuConfig();

  /**
   * The orientation for keyboard navigation within the content.
   * Use 'vertical' for list layouts (default), 'horizontal' for grid layouts.
   * @default 'vertical'
   */
  readonly orientation = input<NgpOrientation>('vertical', {
    alias: 'ngpNavigationMenuContentOrientation',
  });

  /**
   * Whether focus should wrap around when reaching the end of the content.
   * @default true
   */
  readonly wrap = input<boolean, BooleanInput>(this.config.wrap, {
    alias: 'ngpNavigationMenuContentWrap',
    transform: booleanAttribute,
  });

  private readonly state = ngpNavigationMenuContent({
    orientation: this.orientation,
  });

  constructor() {
    // Create roving focus group for content items
    ngpRovingFocusGroup({
      orientation: this.orientation,
      wrap: this.wrap,
      inherit: false,
    });
  }

  /**
   * Close the content panel.
   */
  close(): void {
    this.state.close();
  }

  /**
   * Focus the first focusable item in the content.
   */
  focusFirst(): void {
    this.state.focusFirst();
  }

  /**
   * Focus the last focusable item in the content.
   */
  focusLast(): void {
    this.state.focusLast();
  }
}
