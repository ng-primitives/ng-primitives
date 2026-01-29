import { Directive } from '@angular/core';
import {
  ngpNavigationMenuViewport,
  provideNavigationMenuViewportState,
} from './navigation-menu-viewport-state';

/**
 * Apply the `ngpNavigationMenuViewport` directive to create an optional container for rendering content.
 */
@Directive({
  selector: '[ngpNavigationMenuViewport]',
  exportAs: 'ngpNavigationMenuViewport',
  providers: [provideNavigationMenuViewportState({ inherit: false })],
})
export class NgpNavigationMenuViewport {
  private readonly state = ngpNavigationMenuViewport();

  /**
   * The width of the active content.
   */
  readonly width = this.state.width;

  /**
   * The height of the active content.
   */
  readonly height = this.state.height;

  /**
   * Whether any content is open.
   */
  readonly open = this.state.open;
}
