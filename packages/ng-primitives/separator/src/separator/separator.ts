import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectSeparatorConfig } from '../config/separator-config';
import { ngpSeparator, provideSeparatorState } from './separator-state';

@Directive({
  selector: '[ngpSeparator]',
  exportAs: 'ngpSeparator',
  providers: [provideSeparatorState()],
})
export class NgpSeparator {
  private readonly config = injectSeparatorConfig();

  /**
   * The orientation of the separator.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpSeparatorOrientation',
  });

  constructor() {
    ngpSeparator(this);
  }
}
