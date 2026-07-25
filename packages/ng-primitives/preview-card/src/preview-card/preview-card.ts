import { Directive, input } from '@angular/core';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { ngpPreviewCard, providePreviewCardState } from './preview-card-state';

/**
 * Apply the `ngpPreviewCard` directive to an element that represents the preview card.
 * This typically would be a `div` inside an `ng-template`.
 */
@Directive({
  selector: '[ngpPreviewCard]',
  exportAs: 'ngpPreviewCard',
  providers: [providePreviewCardState(), provideControlContainerIsolation()],
})
export class NgpPreviewCard {
  /**
   * The unique id of the preview card.
   */
  readonly id = input('');

  protected readonly state = ngpPreviewCard({
    id: this.id,
  });
}
