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
    ngpTooltip: '',
  },
})
export class NgpTooltipTextContentComponent {
  /**
   * The string content to display
   */
  readonly content = injectOverlayContext();
}
