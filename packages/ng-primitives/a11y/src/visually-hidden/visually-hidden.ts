import { Directive } from '@angular/core';
import { ngpVisuallyHiddenPattern, provideVisuallyHiddenPattern } from './visually-hidden-pattern';

/**
 * Hide an element visually while keeping it present in the DOM.
 */
@Directive({
  selector: '[ngpVisuallyHidden]',
  exportAs: 'ngpVisuallyHidden',
  providers: [provideVisuallyHiddenPattern(NgpVisuallyHidden, instance => instance.pattern)],
  host: {
    '[style]': 'pattern.style()',
  },
})
export class NgpVisuallyHidden {
  /**
   * The visually hidden pattern.
   */
  readonly pattern = ngpVisuallyHiddenPattern({});

  /**
   * Set the element visibility.
   * @param visible
   */
  setVisibility(visible: boolean): void {
    this.pattern.setVisibility(visible);
  }
}
