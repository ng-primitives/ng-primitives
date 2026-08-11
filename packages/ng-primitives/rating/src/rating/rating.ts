import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, numberAttribute, output } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { coerceNumberOrUndefined, uniqueId } from 'ng-primitives/utils';
import { injectRatingConfig } from '../config/rating-config';
import { ngpRating, provideRatingState } from './rating-state';

/**
 * Apply the `ngpRating` directive to an element that represents the rating. It
 * exposes the slider role and owns the value, keyboard, and form integration.
 * Project the star markup once via the `*ngpRatingItem` structural directive.
 */
@Directive({
  selector: '[ngpRating]',
  exportAs: 'ngpRating',
  providers: [provideRatingState()],
})
export class NgpRating {
  private readonly config = injectRatingConfig();

  /**
   * The id of the rating. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-rating'));

  /**
   * The value of the rating. When defined the rating is controlled.
   */
  readonly value = input<number | undefined, NumberInput>(undefined, {
    alias: 'ngpRatingValue',
    transform: coerceNumberOrUndefined,
  });

  /**
   * The default value of the rating for uncontrolled usage.
   * @default 0
   */
  readonly defaultValue = input<number, NumberInput>(0, {
    alias: 'ngpRatingDefaultValue',
    transform: (value: NumberInput) => numberAttribute(value, 0),
  });

  /**
   * Emits when the value changes.
   */
  readonly valueChange = output<number>({
    alias: 'ngpRatingValueChange',
  });

  /**
   * The number of items in the rating.
   */
  readonly count = input<number, NumberInput>(this.config.count, {
    alias: 'ngpRatingCount',
    transform: numberAttribute,
  });

  /**
   * Whether half values are allowed.
   */
  readonly allowHalf = input<boolean, BooleanInput>(false, {
    alias: 'ngpRatingAllowHalf',
    transform: booleanAttribute,
  });

  /**
   * Whether the rating is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpRatingDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether the rating is read-only.
   */
  readonly readonly = input<boolean, BooleanInput>(false, {
    alias: 'ngpRatingReadonly',
    transform: booleanAttribute,
  });

  /**
   * Whether re-selecting the current value clears the rating to 0 (deselection).
   */
  readonly clearable = input<boolean, BooleanInput>(this.config.clearable, {
    alias: 'ngpRatingClearable',
    transform: booleanAttribute,
  });

  /**
   * Produce the `aria-valuetext` announced to assistive technology.
   */
  readonly valueText = input<(value: number, count: number) => string>(this.config.valueText, {
    alias: 'ngpRatingValueText',
  });

  /**
   * The state of the rating.
   */
  protected readonly state = ngpRating({
    id: this.id,
    value: this.value,
    defaultValue: this.defaultValue,
    count: this.count,
    allowHalf: this.allowHalf,
    disabled: this.disabled,
    readonly: this.readonly,
    clearable: this.clearable,
    valueText: this.valueText,
    onValueChange: value => this.valueChange.emit(value),
  });

  /**
   * Set the value of the rating.
   */
  setValue(value: number, options?: SetterOptions): void {
    this.state.setValue(value, options);
  }
}
