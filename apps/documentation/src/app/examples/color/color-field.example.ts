import { Component } from '@angular/core';
import { Color, NgpColorField, NgpColorPicker } from 'ng-primitives/color';

@Component({
  selector: 'app-color-field',
  imports: [NgpColorPicker, NgpColorField],
  styles: `
    [ngpColorPicker] {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .swatch {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field label {
      font-size: 0.75rem;
      font-weight: 510;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }

    [ngpColorField] {
      width: 3.5rem;
      height: 34px;
      padding: 0 0.5rem;
      font-size: 0.875rem;
      font-weight: 510;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      outline: none;
    }

    [ngpColorField][data-focus] {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }
  `,
  template: `
    <!-- channel-mode fields, coordinated by the picker so they update together -->
    <div [(ngpColorPickerValue)]="color" ngpColorPicker>
      <div class="swatch" [style.background]="color.toHex()"></div>

      <div class="field">
        <label for="r">R</label>
        <input id="r" ngpColorField ngpColorFieldChannel="red" />
      </div>
      <div class="field">
        <label for="g">G</label>
        <input id="g" ngpColorField ngpColorFieldChannel="green" />
      </div>
      <div class="field">
        <label for="b">B</label>
        <input id="b" ngpColorField ngpColorFieldChannel="blue" />
      </div>
    </div>
  `,
})
export default class ColorFieldExample {
  color: Color = Color.parse('#3366cc');
}
