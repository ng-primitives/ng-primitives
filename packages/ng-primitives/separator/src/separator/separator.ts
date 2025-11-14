import { Directive, input } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectSeparatorConfig } from '../config/separator-config';
import { ngpSeparatorPattern, provideSeparatorPattern } from './separator-pattern';

@Directive({
  selector: '[ngpSeparator]',
  exportAs: 'ngpSeparator',
  providers: [provideSeparatorPattern(NgpSeparator, instance => instance.pattern)],
})
export class NgpSeparator {
  private readonly config = injectSeparatorConfig();

  /**
   * The orientation of the separator.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpSeparatorOrientation',
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSeparatorPattern({
    orientation: this.orientation,
  });
}
