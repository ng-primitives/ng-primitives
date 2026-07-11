import { Component } from '@angular/core';
import { Color, NgpColorSwatchPicker, NgpColorSwatchPickerItem } from 'ng-primitives/color';

@Component({
  selector: 'app-color-swatch-picker',
  imports: [NgpColorSwatchPicker, NgpColorSwatchPickerItem],
  styles: `
    [ngpColorSwatchPicker] {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-width: 200px;
      outline: none;
    }

    .swatch {
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: 0.5rem;
      background: var(--ngp-color-swatch-color);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
      cursor: pointer;
      outline: none;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .swatch[data-hover] {
      transform: scale(1.08);
    }

    .swatch[data-focus-visible] {
      box-shadow:
        inset 0 0 0 1px rgb(0 0 0 / 0.1),
        0 0 0 2px var(--ngp-focus-ring);
    }

    /* the selected swatch gets a neutral ring so it doesn't clash with the swatch colors */
    .swatch[data-selected] {
      box-shadow:
        inset 0 0 0 1px rgb(0 0 0 / 0.1),
        0 0 0 2px var(--ngp-background),
        0 0 0 3.5px var(--ngp-text-primary);
    }
  `,
  template: `
    <div [(ngpColorSwatchPickerValue)]="color" ngpColorSwatchPicker aria-label="Color swatches">
      @for (swatch of swatches; track swatch) {
        <button
          class="swatch"
          [ngpColorSwatchPickerItem]="swatch"
          [attr.aria-label]="swatch.toHex()"
        ></button>
      }
    </div>
  `,
})
export default class ColorSwatchPickerExample {
  readonly swatches: Color[] = [
    '#f01e2b',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#111827',
  ].map(hex => Color.parse(hex));
  color: Color = Color.parse('#3b82f6');
}
