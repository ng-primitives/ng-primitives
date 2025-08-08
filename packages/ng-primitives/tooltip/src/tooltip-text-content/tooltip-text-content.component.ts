import { Component } from '@angular/core';
import { injectOverlayContext } from 'ng-primitives/portal';
import { NgpTooltip } from '../tooltip/tooltip';

/**
 * Internal component for wrapping string content in tooltip portals
 * @internal
 */
@Component({
  template: '{{ content() }}',
  hostDirectives: [NgpTooltip],
  host: {
    // Used only for styling, since the host directive isn’t added to the DOM.
    // This acts as the styling entry point.
    ngpTooltip: '',
  },
})
export class NgpTooltipTextContentComponent {
  /**
   * The string content to display
   */
  readonly content = injectOverlayContext();
}
