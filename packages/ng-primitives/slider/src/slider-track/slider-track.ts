import { Directive, HostListener } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSliderState } from '../slider/slider-state';

/**
 * Apply the `ngpSliderTrack` directive to an element that represents the track of the slider.
 */
@Directive({
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  host: {
    '[attr.data-orientation]': 'sliderState().orientation()',
    '[attr.data-disabled]': 'sliderState().disabled() ? "" : null',
  },
})
export class NgpSliderTrack {
  /**
   * Access the slider state.
   */
  protected readonly sliderState = injectSliderState();

  /**
   * The element that represents the slider track.
   */
  readonly element = injectElementRef<HTMLElement>();

  constructor() {
    this.sliderState().track.set(this);
  }

  /**
   * When the slider track is clicked, update the value.
   * @param event The click event.
   */
  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(event: PointerEvent): void {
    if (this.sliderState().disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const position =
      this.sliderState().orientation() === 'horizontal' ? event.clientX : event.clientY;
    const rect = this.element.nativeElement.getBoundingClientRect();
    const percentage =
      (position - (this.sliderState().orientation() === 'horizontal' ? rect.left : rect.top)) /
      (this.sliderState().orientation() === 'horizontal' ? rect.width : rect.height);

    // update the value based on the position
    this.sliderState().value.set(
      this.sliderState().min() + (this.sliderState().max() - this.sliderState().min()) * percentage,
    );
    this.sliderState().valueChange.emit(this.sliderState().value());
  }
}
