import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectSeparatorConfig } from '../config/separator-config';

@Directive({
  selector: '[ngpSeparator]',
  exportAs: 'ngpSeparator',
  host: {
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class NgpSeparator {
  private readonly config = injectSeparatorConfig();

  /**
   * The orientation of the separator.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpSeparatorOrientation',
  });
}
