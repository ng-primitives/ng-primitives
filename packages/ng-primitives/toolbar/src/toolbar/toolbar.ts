import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { syncState } from 'ng-primitives/internal';
import { injectRovingFocusGroupState, NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { provideToolbarState, toolbarState } from './toolbar-state';

@Directive({
  selector: '[ngpToolbar]',
  exportAs: 'ngpToolbar',
  providers: [provideToolbarState()],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'toolbar',
    '[attr.aria-orientation]': 'state.orientation()',
    '[attr.data-orientation]': 'state.orientation()',
  },
})
export class NgpToolbar {
  /**
   * Access the roving focus group state.
   */
  private readonly rovingFocusGroup = injectRovingFocusGroupState();

  /**
   * The orientation of the toolbar.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpToolbarOrientation',
  });

  /**
   * The toolbar state.
   */
  protected readonly state = toolbarState<NgpToolbar>(this);

  constructor() {
    syncState(this.state.orientation, this.rovingFocusGroup().orientation);
  }
}
