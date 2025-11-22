import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpRovingFocusGroup, provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { ngpToolbar, provideToolbarState } from './toolbar-state';

@Directive({
  selector: '[ngpToolbar]',
  exportAs: 'ngpToolbar',
  providers: [provideToolbarState(), provideRovingFocusGroupState()],
})
export class NgpToolbar {
  /**
   * The orientation of the toolbar.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpToolbarOrientation',
  });

  /**
   * The toolbar state.
   */
  protected readonly state = ngpToolbar({
    rovingFocusGroup: ngpRovingFocusGroup({ orientation: this.state.orientation }),
    orientation: this.state.orientation,
  });
}
