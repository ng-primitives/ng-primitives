/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { injectSlider } from '../slider/slider.token';
import { NgpSliderTrackToken } from './slider-track.token';

@Directive({
  standalone: true,
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  providers: [{ provide: NgpSliderTrackToken, useExisting: NgpSliderTrack }],
  host: {
    '[attr.data-orientation]': 'slider.orientation()',
    '[attr.data-disabled]': 'slider.disabled() ? "" : null',
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
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

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
    this.slider.value.set(this.slider.min() + (this.slider.max() - this.slider.min()) * percentage);
  }
}
