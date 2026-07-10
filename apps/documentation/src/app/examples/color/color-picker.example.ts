import { Component } from '@angular/core';
import {
  Color,
  NgpColorArea,
  NgpColorAreaThumb,
  NgpColorField,
  NgpColorPicker,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';

@Component({
  selector: 'app-color-picker',
  imports: [
    NgpColorPicker,
    NgpColorArea,
    NgpColorAreaThumb,
    NgpColorSlider,
    NgpColorSliderTrack,
    NgpColorSliderThumb,
    NgpColorField,
  ],
  styles: `
    [ngpColorPicker] {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 240px;
      padding: 12px;
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
    }

    [ngpColorArea] {
      position: relative;
      width: 100%;
      height: 160px;
      border-radius: 0.625rem;
      /* the functional 2D gradient computed by the primitive */
      background: var(--ngp-color-area-background);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
      touch-action: none;
      user-select: none;
    }

    [ngpColorAreaThumb] {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid #fff;
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.3),
        0 1px 2px rgb(0 0 0 / 0.3);
      transform: translate(-50%, -50%);
      outline: none;
    }

    /* invisible 44px touch target */
    [ngpColorAreaThumb]::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      transform: translate(-50%, -50%);
    }

    [ngpColorAreaThumb][data-focus-visible] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.3),
        0 0 0 3px var(--ngp-focus-ring);
    }

    [ngpColorSlider] {
      position: relative;
      width: 100%;
      height: 14px;
      touch-action: none;
      user-select: none;
    }

    [ngpColorSliderTrack] {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      /* the functional channel gradient computed by the primitive */
      background: var(--ngp-color-slider-background);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    [ngpColorSliderThumb] {
      position: absolute;
      top: 50%;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: transparent;
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

    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-picker-preview {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    [ngpColorField] {
      flex: 1;
      min-width: 0;
      height: 34px;
      padding: 0 0.625rem;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      outline: none;
      text-transform: lowercase;
    }

    [ngpColorField][data-focus] {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }
  `,
  template: `
    <div [(ngpColorPickerValue)]="color" ngpColorPicker>
      <div ngpColorArea ngpColorAreaXChannel="saturation" ngpColorAreaYChannel="brightness">
        <div ngpColorAreaThumb></div>
      </div>

      <div ngpColorSlider ngpColorSliderChannel="hue">
        <div ngpColorSliderTrack></div>
        <div ngpColorSliderThumb></div>
      </div>

      <div class="color-picker-row">
        <div class="color-picker-preview" [style.background]="color.toHex()"></div>
        <input ngpColorField aria-label="Hex" />
      </div>
    </div>
  `,
})
export default class ColorPickerExample {
  color: Color = Color.parse('#f01e2b');
}
