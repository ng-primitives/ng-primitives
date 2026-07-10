import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { provideInputState } from 'ng-primitives/input';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Color, ColorChannel, ColorSpace } from '../color/color';
import { ngpColorField, provideColorFieldState } from './color-field-state';

/**
 * Apply the `ngpColorField` directive to an `input` element to edit a color. Without a channel it
 * edits the whole color as a hex string; with a channel it edits that single channel as a number.
 * It composes the input primitive, so it provides the input state.
 */
@Directive({
  selector: 'input[ngpColorField]',
  exportAs: 'ngpColorField',
  providers: [provideColorFieldState(), provideInputState({ inherit: false })],
})
export class NgpColorField {
  /** The id of the field. */
  readonly id = input<string>(uniqueId('ngp-color-field'));

  /** The color value. */
  readonly value = input<Color>(Color.parse('#ff0000'), {
    alias: 'ngpColorFieldValue',
  });

  /** Emits when the value changes. */
  readonly valueChange = output<Color>({
    alias: 'ngpColorFieldValueChange',
  });

  /** The channel to edit. When omitted, the field edits the whole color as hex. */
  readonly channel = input<ColorChannel | undefined>(undefined, {
    alias: 'ngpColorFieldChannel',
  });

  /** The color space for channel mode. Resolved from the channel/value when not set. */
  readonly colorSpace = input<ColorSpace | undefined>(undefined, {
    alias: 'ngpColorFieldColorSpace',
  });

  /** The disabled state of the field. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpColorFieldDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpColorField({
    id: this.id,
    value: this.value,
    channel: this.channel,
    colorSpace: this.colorSpace,
    disabled: this.disabled,
    onValueChange: value => this.valueChange.emit(value),
  });

  /** Set the value of the field. */
  setValue(value: Color, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }

  /** Set the disabled state. */
  setDisabled(disabled: boolean): void {
    this.state.setDisabled(disabled);
  }
}
