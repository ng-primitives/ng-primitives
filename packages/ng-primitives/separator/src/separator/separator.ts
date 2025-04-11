import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectSeparatorConfig } from '../config/separator-config';
import { NgpSeparatorToken } from './separator-token';

@Directive({
  selector: '[ngpSeparator]',
  exportAs: 'ngpSeparator',
  providers: [{ provide: NgpSeparatorToken, useExisting: NgpSeparator }],
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
