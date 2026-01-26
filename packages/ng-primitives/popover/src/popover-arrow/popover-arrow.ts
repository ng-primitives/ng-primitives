import { NumberInput } from '@angular/cdk/coercion';
import { Directive, input, numberAttribute } from '@angular/core';
import { ngpPopoverArrow, providePopoverArrowState } from './popover-arrow-state';

@Directive({
  selector: '[ngpPopoverArrow]',
  exportAs: 'ngpPopoverArrow',
  providers: [providePopoverArrowState()],
})
export class NgpPopoverArrow {
  /**
   * Padding between the arrow and the edges of the popover.
   * This prevents the arrow from overflowing the rounded corners.
   */
  readonly padding = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpPopoverArrowPadding',
    transform: numberAttribute,
  });

  private readonly state = ngpPopoverArrow({ padding: this.padding });

  /**
   * Set the padding between the arrow and the edges of the popover.
   * @param value The padding value in pixels
   */
  setPadding(value: number | undefined): void {
    this.state.setPadding(value);
  }
}
