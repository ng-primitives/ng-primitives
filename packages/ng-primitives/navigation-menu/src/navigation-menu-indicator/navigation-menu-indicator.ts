import { Directive } from '@angular/core';
import {
  ngpNavigationMenuIndicator,
  provideNavigationMenuIndicatorState,
} from './navigation-menu-indicator-state';

/**
 * Apply the `ngpNavigationMenuIndicator` directive to display a visual indicator for the active trigger.
 */
@Directive({
  selector: '[ngpNavigationMenuIndicator]',
  exportAs: 'ngpNavigationMenuIndicator',
  providers: [provideNavigationMenuIndicatorState({ inherit: false })],
})
export class NgpNavigationMenuIndicator {
  private readonly state = ngpNavigationMenuIndicator();

  /**
   * Whether the indicator is visible.
   */
  readonly visible = this.state.visible;

  /**
   * The position of the indicator.
   */
  readonly position = this.state.position;
}
