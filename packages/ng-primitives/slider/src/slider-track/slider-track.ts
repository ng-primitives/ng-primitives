import { Directive, HostListener } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSliderState } from '../slider/slider-state';
import { injectSlider } from '../slider/slider-token';
import { provideSliderTrack } from './slider-track-token';

@Directive({
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  providers: [provideSliderTrack(NgpSliderTrack)],
  host: {
    '[attr.data-orientation]': 'state().orientation()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
  },
})
export class NgpSliderTrack {
  /**
   * Access the slider.
   */
  protected readonly slider = injectSlider();

  /**
   * Access the slider state.
   */
  protected readonly state = injectSliderState();

  /**
   * The element that represents the slider track.
   */
  readonly element = injectElementRef<HTMLElement>();

  constructor() {
    this.slider.track.set(this);
  }

  /**
   * When the slider track is clicked, update the value.
   * @param event The click event.
   */
  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(event: PointerEvent): void {
    if (this.state().disabled()) {
      return;
    }

    // get the position the click occurred within the slider track
    const position = this.state().orientation() === 'horizontal' ? event.clientX : event.clientY;
    const rect = this.element.nativeElement.getBoundingClientRect();
    const percentage =
      (position - (this.state().orientation() === 'horizontal' ? rect.left : rect.top)) /
      (this.state().orientation() === 'horizontal' ? rect.width : rect.height);

    // update the value based on the position
    this.state().value.set(
      this.state().min() + (this.state().max() - this.state().min()) * percentage,
    );
    this.state().valueChange.emit(this.state().value());
  }
}
