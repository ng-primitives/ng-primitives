import { Directive, HostListener } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectRangeSliderState } from '../range-slider/range-slider-state';

/**
 * Apply the `ngpRangeSliderTrack` directive to an element that represents the track of the range slider.
 */
@Directive({
  selector: '[ngpRangeSliderTrack]',
  exportAs: 'ngpRangeSliderTrack',
  host: {
    '[attr.data-orientation]': 'rangeSliderState().orientation()',
    '[attr.data-disabled]': 'rangeSliderState().disabled() ? "" : null',
  },
})
export class NgpRangeSliderTrack {
  /**
   * Access the range slider state.
   */
  protected readonly rangeSliderState = injectRangeSliderState();

  /**
   * The element that represents the slider track.
   */
  readonly element = injectElementRef<HTMLElement>();

  constructor() {
    this.rangeSliderState().track.set(this);
  }

  /**
   * When the slider track is clicked, update the closest thumb value.
   * @param event The click event.
   */
  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(event: PointerEvent): void {
    if (this.rangeSliderState().disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const position =
      this.rangeSliderState().orientation() === 'horizontal' ? event.clientX : event.clientY;
    const rect = this.element.nativeElement.getBoundingClientRect();
    const percentage =
      (position - (this.rangeSliderState().orientation() === 'horizontal' ? rect.left : rect.top)) /
      (this.rangeSliderState().orientation() === 'horizontal' ? rect.width : rect.height);

    // calculate the value based on the position
    const value =
      this.rangeSliderState().min() +
      (this.rangeSliderState().max() - this.rangeSliderState().min()) * percentage;

    // determine which thumb to move based on proximity
    const closestThumb = this.rangeSliderState().getClosestThumb(percentage * 100);

    if (closestThumb === 'low') {
      this.rangeSliderState().updateLowValue(value);
    } else {
      this.rangeSliderState().updateHighValue(value);
    }
  }
}
