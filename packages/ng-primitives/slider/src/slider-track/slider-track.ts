import { Directive, HostListener } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSliderPattern } from '../slider/slider-pattern';
import { ngpSliderTrackPattern, provideSliderTrackPattern } from './slider-track-pattern';

/**
 * Apply the `ngpSliderTrack` directive to an element that represents the track of the slider.
 */
@Directive({
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  host: {
    '[attr.data-orientation]': 'slider.orientation()',
    '[attr.data-disabled]': 'slider.disabled() ? "" : null',
  },
  providers: [provideSliderTrackPattern(NgpSliderTrack, instance => instance.pattern)],
})
export class NgpSliderTrack {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSliderTrackPattern({});

  /**
   * Access the slider state.
   */
  protected readonly slider = injectSliderPattern();

  /**
   * The element that represents the slider track.
   */
  readonly element = injectElementRef<HTMLElement>();

  constructor() {
    this.slider.setTrack(this.element);
  }

  /**
   * When the slider track is clicked, update the value.
   * @param event The click event.
   */
  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(event: PointerEvent): void {
    if (this.slider.disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const position = this.slider.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const rect = this.element.nativeElement.getBoundingClientRect();
    const percentage =
      (position - (this.slider.orientation() === 'horizontal' ? rect.left : rect.top)) /
      (this.slider.orientation() === 'horizontal' ? rect.width : rect.height);

    // update the value based on the position
    this.slider.setValue(this.slider.min() + (this.slider.max() - this.slider.min()) * percentage);
  }
}
