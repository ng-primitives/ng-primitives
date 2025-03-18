/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectSlider } from '../slider/slider.token';
import { provideSliderTrack } from './slider-track.token';

@Directive({
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  providers: [provideSliderTrack(NgpSliderTrack)],
  host: {
    '[attr.data-orientation]': 'slider.orientation()',
    '[attr.data-disabled]': 'slider.state.disabled() ? "" : null',
  },
})
export class NgpSliderTrack {
  /**
   * Access the slider.
   */
  protected readonly slider = injectSlider();

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
    this.slider.state.setValue(
      this.slider.min() + (this.slider.max() - this.slider.min()) * percentage,
    );
  }
}
