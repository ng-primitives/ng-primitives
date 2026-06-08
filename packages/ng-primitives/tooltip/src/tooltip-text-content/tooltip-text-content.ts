import { Component } from '@angular/core';
import { NgpTooltip } from '../tooltip/tooltip';
import { ngpTooltipTextContent } from './tooltip-text-content-state';

/**
 * Internal component for wrapping string content in tooltip portals
 * @internal
 */
@Component({
  template: '{{ state.content() }}',
  hostDirectives: [NgpTooltip],
  host: {
    // Used only for styling, since the host directive isn’t added to the DOM.
    // This acts as the styling entry point.
    ngpTooltip: '',
  },
})
export class NgpTooltipTextContentComponent {
  protected readonly state = ngpTooltipTextContent({});
}
