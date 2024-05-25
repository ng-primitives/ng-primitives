/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, ElementRef, inject } from '@angular/core';
import { NgpSliderTrackToken } from './slider-track.token';

@Directive({
  standalone: true,
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  providers: [{ provide: NgpSliderTrackToken, useExisting: NgpSliderTrackDirective }],
})
export class NgpSliderTrackDirective {
  /**
   * The element that represents the slider track.
   */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
}
