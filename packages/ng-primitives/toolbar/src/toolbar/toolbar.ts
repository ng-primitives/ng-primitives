import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { NgpRovingFocusGroup } from 'ng-primitives/roving-focus';

@Directive({
  selector: '[ngpToolbar]',
  exportAs: 'ngpToolbar',
  hostDirectives: [
    {
      directive: NgpRovingFocusGroup,
      inputs: ['ngpRovingFocusGroupOrientation:ngpToolbarOrientation'],
    },
  ],
  host: {
    role: 'toolbar',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpToolbar {
  /**
   * The orientation of the toolbar.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpToolbarOrientation',
  });
}
