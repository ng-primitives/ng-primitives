import { Component } from '@angular/core';
import { Color, NgpColorWheel, NgpColorWheelThumb } from 'ng-primitives/color';

@Component({
  selector: 'app-color-wheel',
  imports: [NgpColorWheel, NgpColorWheelThumb],
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .swatch {
      width: 40px;
      height: 40px;
      border-radius: 0.625rem;
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.1);
    }

    [ngpColorWheel] {
      position: relative;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: var(--ngp-color-wheel-background);
      /* carve out the centre to leave a colour ring */
      mask: radial-gradient(farthest-side, transparent calc(100% - 26px), #000 calc(100% - 26px));
      touch-action: none;
      user-select: none;
    }

    [ngpColorWheelThumb] {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 18px;
      height: 18px;
      margin: -9px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.3),
        0 1px 2px rgb(0 0 0 / 0.3);
      /* position on the ring using the hue angle exposed by the primitive */
      transform: rotate(var(--ngp-color-wheel-hue)) translateY(-77px);
      outline: none;
    }

    /* invisible 44px touch target */
    [ngpColorWheelThumb]::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 44px;
      height: 44px;
      transform: translate(-50%, -50%);
    }

    [ngpColorWheelThumb][data-focus-visible] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.3),
        0 0 0 3px var(--ngp-focus-ring);
    }
  `,
  template: `
    <div [(ngpColorWheelValue)]="color" ngpColorWheel>
      <div ngpColorWheelThumb></div>
    </div>

    <div class="swatch" [style.background]="color.toHex()"></div>
  `,
})
export default class ColorWheelExample {
  color: Color = Color.parse('hsl(140, 90%, 50%)');
}
