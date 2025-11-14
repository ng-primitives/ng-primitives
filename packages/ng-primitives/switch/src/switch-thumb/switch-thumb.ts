import { Directive } from '@angular/core';
import { ngpSwitchThumbPattern, provideSwitchThumbPattern } from './switch-thumb-pattern';

/**
 * Apply the `ngpSwitchThumb` directive to an element within a switch to represent the thumb.
 */
@Directive({
  selector: '[ngpSwitchThumb]',
  providers: [provideSwitchThumbPattern(NgpSwitchThumb, instance => instance.pattern)],
})
export class NgpSwitchThumb {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSwitchThumbPattern({});
}
