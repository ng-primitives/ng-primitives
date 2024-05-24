/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener } from '@angular/core';
import { injectSlider } from '../slider/slider.token';
import { NgpSliderThumbToken } from './slider-thumb.token';

@Directive({
  standalone: true,
  selector: '[ngpSliderThumb]',
  exportAs: 'ngpSliderThumb',
  providers: [{ provide: NgpSliderThumbToken, useExisting: NgpSliderThumbDirective }],
  host: {
    role: 'slider',
    '[attr.aria-valuemin]': 'slider.min()',
    '[attr.aria-valuemax]': 'slider.max()',
    '[attr.aria-valuenow]': 'slider.value()',
    '[attr.aria-orientation]': 'slider.orientation()',
    '[tabindex]': 'slider.disabled() ? -1 : 0',
    '[attr.data-orientation]': 'slider.orientation()',
    '[attr.data-disabled]': 'slider.disabled()',
    '[style.inset-inline-start.%]':
      'slider.orientation() === "horizontal" ? slider.percentage() : undefined',
    '[style.inset-block-start.%]':
      'slider.orientation() === "vertical" ? slider.percentage() : undefined',
  },
})
export class NgpSliderThumbDirective {
  /**
   * Access the slider.
   */
  protected readonly slider = injectSlider();

  /**
   * Handle keyboard events.
   */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const multiplier = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.slider.value.update(value =>
          Math.max(value - this.slider.step() * multiplier, this.slider.min()),
        );
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        this.slider.value.update(value =>
          Math.min(value + this.slider.step() * multiplier, this.slider.max()),
        );
        break;
      case 'Home':
        this.slider.value.set(this.slider.min());
        break;
      case 'End':
        this.slider.value.set(this.slider.max());
        break;
    }
  }
}
