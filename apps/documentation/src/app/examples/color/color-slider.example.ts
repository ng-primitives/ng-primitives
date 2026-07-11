import { Component } from '@angular/core';
import {
  Color,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';

@Component({
  selector: 'app-color-slider',
  imports: [NgpColorSlider, NgpColorSliderTrack, NgpColorSliderThumb],
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .swatch {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    [ngpColorSlider] {
      position: relative;
      width: 200px;
      height: 14px;
      touch-action: none;
      user-select: none;
    }

    [ngpColorSliderTrack] {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--ngp-color-slider-background);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    [ngpColorSliderThumb] {
      position: absolute;
      top: 50%;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.3),
        0 1px 2px rgb(0 0 0 / 0.3);
      transform: translate(-50%, -50%);
      outline: none;
    }

    /* invisible 44px touch target */
    [ngpColorSliderThumb]::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      transform: translate(-50%, -50%);
    }

    [ngpColorSliderThumb][data-focus-visible] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.3),
        0 0 0 3px var(--ngp-focus-ring);
    }
  `,
  template: `
    <!-- a color slider works standalone, without a color picker -->
    <div class="swatch" [style.background]="color.toHex()"></div>

    <div [(ngpColorSliderValue)]="color" ngpColorSlider ngpColorSliderChannel="hue">
      <div ngpColorSliderTrack></div>
      <div ngpColorSliderThumb></div>
    </div>
  `,
})
export default class ColorSliderExample {
  color: Color = Color.parse('hsl(200, 90%, 50%)');
}
