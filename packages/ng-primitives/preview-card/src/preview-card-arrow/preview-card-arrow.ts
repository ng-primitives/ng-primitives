import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute } from '@angular/core';
import { ngpPreviewCardArrow, providePreviewCardArrowState } from './preview-card-arrow-state';

/**
 * Apply the `ngpPreviewCardArrow` directive to an element inside the preview card to
 * render an arrow pointing at the trigger.
 */
@Directive({
  selector: '[ngpPreviewCardArrow]',
  exportAs: 'ngpPreviewCardArrow',
  providers: [providePreviewCardArrowState()],
})
export class NgpPreviewCardArrow {
  /**
   * Padding between the arrow and the edges of the preview card.
   * This prevents the arrow from overflowing the rounded corners.
   */
  readonly padding = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpPreviewCardArrowPadding',
    transform: numberAttribute,
  });

  private readonly state = ngpPreviewCardArrow({ padding: this.padding });

  /**
   * Set the padding between the arrow and the edges of the preview card.
   * @param value The padding value in pixels
   */
  setPadding(value: number | undefined): void {
    this.state.setPadding(value);
  }
}
