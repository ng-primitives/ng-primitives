import { Directive } from '@angular/core';
import { ngpVisuallyHidden, provideVisuallyHiddenState } from './visually-hidden-state';

/**
 * Hide an element visually while keeping it present in the DOM.
 */
@Directive({
  selector: '[ngpVisuallyHidden]',
  exportAs: 'ngpVisuallyHidden',
  providers: [provideVisuallyHiddenState()],
})
export class NgpVisuallyHidden {
  protected readonly state = ngpVisuallyHidden({});

  /**
   * Set the element visibility.
   * @param visible
   */
  setVisibility(visible: boolean): void {
    this.state.setVisibility(visible);
  }
}
