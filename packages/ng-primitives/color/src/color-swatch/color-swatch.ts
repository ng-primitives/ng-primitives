import { Directive, input } from '@angular/core';
import { Color } from '../color/color';
import { ngpColorSwatch, provideColorSwatchState } from './color-swatch-state';

/**
 * Apply the `ngpColorSwatch` directive to an element to display a color preview. Set its background to
 * `var(--ngp-color-swatch-color)`. Inside a color picker it shows the picker's value by default.
 */
@Directive({
  selector: '[ngpColorSwatch]',
  exportAs: 'ngpColorSwatch',
  providers: [provideColorSwatchState()],
})
export class NgpColorSwatch {
  /** The color to display. Falls back to the parent picker's value when omitted. */
  readonly color = input<Color | undefined, Color | '' | undefined>(undefined, {
    alias: 'ngpColorSwatch',
    // an empty/bare attribute means "no explicit color" — fall back to the parent picker
    transform: value => value || undefined,
  });

  /** An accessible label. Defaults to the color's hex string. */
  readonly label = input<string | undefined>(undefined, {
    alias: 'ngpColorSwatchLabel',
  });

  protected readonly state = ngpColorSwatch({
    color: this.color,
    label: this.label,
  });
}
