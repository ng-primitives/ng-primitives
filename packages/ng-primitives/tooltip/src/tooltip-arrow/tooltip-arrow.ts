import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute } from '@angular/core';
import { ngpTooltipArrow, provideTooltipArrowState } from './tooltip-arrow-state';

@Directive({
  selector: '[ngpTooltipArrow]',
  exportAs: 'ngpTooltipArrow',
  providers: [provideTooltipArrowState()],
})
export class NgpTooltipArrow {
  /**
   * Padding between the arrow and the edges of the tooltip.
   * This prevents the arrow from overflowing the rounded corners.
   */
  readonly padding = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpTooltipArrowPadding',
    transform: numberAttribute,
  });

  private readonly state = ngpTooltipArrow({ padding: this.padding });

  /**
   * Set the padding between the arrow and the edges of the tooltip.
   * @param value The padding value in pixels
   */
  setPadding(value: number | undefined): void {
    this.state.setPadding(value);
  }
}
