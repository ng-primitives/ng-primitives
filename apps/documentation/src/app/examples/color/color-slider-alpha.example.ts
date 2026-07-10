import { Component } from '@angular/core';
import {
  Color,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';

@Component({
  selector: 'app-color-slider-alpha',
  imports: [NgpColorSlider, NgpColorSliderTrack, NgpColorSliderThumb],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .value {
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
      color: var(--ngp-text-secondary);
      letter-spacing: -0.006em;
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
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
      /* the channel gradient (transparent -> opaque) sits over a checkerboard */
      background:
        var(--ngp-color-slider-background),
        conic-gradient(#c8c8c8 25%, #fff 0 50%, #c8c8c8 0 75%, #fff 0);
      background-size:
        auto,
        12px 12px;
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
    <div [(ngpColorSliderValue)]="color" ngpColorSlider ngpColorSliderChannel="alpha">
      <div ngpColorSliderTrack></div>
      <div ngpColorSliderThumb></div>
    </div>

    <span class="value">{{ color.toRgba() }}</span>
  `,
})
export default class ColorSliderAlphaExample {
  color: Color = Color.parse('rgba(240, 30, 43, 1)');
}
