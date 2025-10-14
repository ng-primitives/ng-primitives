import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { ngpToolbarPattern, provideToolbarPattern } from './toolbar-pattern';

@Directive({
  selector: '[ngpToolbar]',
  exportAs: 'ngpToolbar',
  providers: [provideToolbarPattern(NgpToolbar, instance => instance.pattern)],
})
export class NgpToolbar {
  /**
   * The orientation of the toolbar.
   */
  readonly orientation = input<NgpOrientation>('horizontal', {
    alias: 'ngpToolbarOrientation',
  });

  /**
   * The pattern state for the toolbar.
   * @internal
   */
  protected readonly pattern = ngpToolbarPattern({
    orientation: this.orientation,
  });
}
