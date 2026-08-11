import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
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
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-color-picker-popover',
  imports: [
    NgpButton,
    NgpPopoverTrigger,
    NgpPopover,
    NgpColorPicker,
    NgpColorArea,
    NgpColorAreaThumb,
    NgpColorSlider,
    NgpColorSliderTrack,
    NgpColorSliderThumb,
    NgpColorField,
  ],
  styles: `
    .trigger {
      width: 34px;
      height: 34px;
      padding: 0;
      border: none;
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.15);
      cursor: pointer;
      outline: none;
    }

    .trigger[data-focus-visible] {
      box-shadow:
        inset 0 0 0 1px rgb(0 0 0 / 0.15),
        0 0 0 2px var(--ngp-focus-ring);
    }

    [ngpPopover] {
      position: absolute;
      width: 240px;
      padding: 12px;
      border-radius: 0.75rem;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      outline: none;
      animation: color-popover-show 0.1s ease-out;
      transform-origin: var(--ngp-popover-transform-origin);
    }

    [ngpPopover][data-exit] {
      animation: color-popover-show 0.1s ease-out reverse;
    }

    @keyframes color-popover-show {
      from {
        opacity: 0;
        transform: scale(0.97);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    [ngpColorPicker] {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    [ngpColorArea] {
      position: relative;
      width: 100%;
      height: 160px;
      border-radius: 0.625rem;
      background: var(--ngp-color-area-background);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
      touch-action: none;
      user-select: none;
    }

    [ngpColorAreaThumb],
    [ngpColorSliderThumb] {
      position: absolute;
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

    /* invisible 44px touch targets */
    [ngpColorAreaThumb]::before,
    [ngpColorSliderThumb]::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      transform: translate(-50%, -50%);
    }

    [ngpColorAreaThumb][data-focus-visible],
    [ngpColorSliderThumb][data-focus-visible] {
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

    [ngpColorSliderThumb] {
      top: 50%;
    }

    [ngpColorSliderTrack] {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--ngp-color-slider-background);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview {
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
    <!-- the trigger swatch shows the current color; clicking opens the picker -->
    <button
      class="trigger"
      [ngpPopoverTrigger]="picker"
      [style.background]="color.toHex()"
      ngpButton
      type="button"
      aria-label="Choose color"
    ></button>

    <ng-template #picker>
      <div ngpPopover>
        <div [(ngpColorPickerValue)]="color" ngpColorPicker>
          <div ngpColorArea ngpColorAreaXChannel="saturation" ngpColorAreaYChannel="brightness">
            <div ngpColorAreaThumb></div>
          </div>

          <div ngpColorSlider ngpColorSliderChannel="hue">
            <div ngpColorSliderTrack></div>
            <div ngpColorSliderThumb></div>
          </div>

          <div class="row">
            <div class="preview" [style.background]="color.toHex()"></div>
            <input ngpColorField aria-label="Hex" />
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export default class ColorPickerPopoverExample {
  color: Color = Color.parse('#f01e2b');
}
