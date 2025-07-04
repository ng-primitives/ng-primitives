import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { explicitEffect } from 'ng-primitives/internal';
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
    explicitEffect([this.state.orientation], ([orientation]) =>
      this.rovingFocusGroup().orientation.set(orientation),
    );
  }
}
