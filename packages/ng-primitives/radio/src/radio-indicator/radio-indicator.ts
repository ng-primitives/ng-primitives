import { Directive } from '@angular/core';
import { NgpHover, NgpPress } from 'ng-primitives/interactions';
import { ngpRadioIndicatorPattern, provideRadioIndicatorPattern } from './radio-indicator-pattern';

/**
 * Apply the `ngpRadioIndicator` directive to an element that represents the radio indicator (i.e. the dot).
 */
@Directive({
  selector: '[ngpRadioIndicator]',
  hostDirectives: [NgpHover, NgpPress],
  providers: [provideRadioIndicatorPattern(NgpRadioIndicator, instance => instance.pattern)],
})
export class NgpRadioIndicator {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpRadioIndicatorPattern();
}
