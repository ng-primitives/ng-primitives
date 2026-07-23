import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { NgpProgressValueTextFn } from './progress';

export interface NgpProgressProps {
  /**
   * The unique identifier for the progress.
   */
  readonly id?: Signal<string>;

  /**
   * Define the progress value.
   */
  readonly value?: Signal<number | null>;

  /**
   * Define the progress min value.
   * @default '0'
   */
  readonly min?: Signal<number>;

  /**
   * Define the progress max value.
   * @default 100
   */
  readonly max?: Signal<number>;

  /**
   * Define a function that returns the progress value label.
   * @param value The current value
   * @param max The maximum value
   * @returns The value label
   */
  readonly valueLabel?: Signal<NgpProgressValueTextFn>;
}

export interface NgpProgressState {
  /**
   * The unique identifier for the progress.
   */
  readonly id: Signal<string>;

  /**
   * Define the progress value.
   */
  readonly value: WritableSignal<number | null>;

  /**
   * Define the progress min value.
   * @default '0'
   */
  readonly min: WritableSignal<number>;

  /**
   * Define the progress max value.
   * @default 100
   */
  readonly max: WritableSignal<number>;

  /**
   * Get the progress value text. An empty string while the progress is
   * indeterminate (the `aria-valuetext` attribute is omitted in that case).
   */
  readonly valueText: Signal<string>;

  /**
   * The id of label associated with the progress bar.
   * @internal
   */
  readonly labelId: Signal<string | undefined>;

  /**
   * Determine if the progress is indeterminate.
   * @internal
   */
  readonly indeterminate: Signal<boolean>;

  /**
   * Determine if the progress is in a progressing state.
   * @internal
   */
  readonly progressing: Signal<boolean>;

  /**
   * Determine if the progress is complete.
   * @internal
   */
  readonly complete: Signal<boolean>;

  /**
   * Set the label of the progress bar.
   */
  setLabel(id: string): void;

  /**
   * Remove the label of the progress bar.
   */
  removeLabel(id: string): void;

  /**
   * Set the value of the progress bar.
   * @param value The progress value
   */
  setValue(value: number | null): void;

  /**
   * Set the minimum value of the progress bar.
   * @param min The minimum value
   */
  setMin(min: number): void;

  /**
   * Set the maximum value of the progress bar.
   * @param max The maximum value
   */
  setMax(max: number): void;
}

export const [NgpProgressStateToken, ngpProgress, injectProgressState, provideProgressState] =
  createPrimitive(
    'NgpProgress',
    ({
      valueLabel: _valueLabel = signal(
        (value, max, min) =>
          `${max === min ? 0 : Math.round(((value - min) / (max - min)) * 100)}%`,
      ),
      value: _value = signal(null),
      min: _min = signal(0),
      max: _max = signal(100),
      id = signal(uniqueId('ngp-progress')),
    }: NgpProgressProps) => {
      const element = injectElementRef();

      // Controlled properties
      const value = controlled(_value);
      const min = controlled(_min);
      const max = controlled(_max);
      const valueLabel = controlled(_valueLabel);

      /**
       * Determine if the progress is indeterminate.
       * @internal
       */
      const indeterminate = computed(() => value() === null);

      /**
       * Determine if the progress is in a progressing state.
       */
      const progressing = computed(
        () => !indeterminate() && valueNow()! > min() && valueNow()! < max(),
      );

      /**
       * Determine if the progress is complete.
       */
      const complete = computed(() => !indeterminate() && valueNow()! >= max() && max() > min());

      /**
       * The raw value exposed via `aria-valuenow`, clamped to the [min, max] range.
       * Per the ARIA progressbar pattern, `aria-valuenow` is the actual value on the
       * same scale as `aria-valuemin`/`aria-valuemax`, not a 0-100 percentage. It is
       * omitted entirely (null) while the progress is indeterminate.
       */
      const valueNow = computed(() => {
        const currentValue = value();

        if (currentValue == null) {
          return null;
        }

        return Math.min(Math.max(currentValue, min()), max());
      });

      /**
       * Get the progress value text. Empty while indeterminate; the
       * aria-valuetext binding omits the attribute in that case.
       */
      const valueText = computed(() => {
        const currentValue = valueNow();

        if (currentValue == null) {
          return '';
        }

        // use the clamped value so aria-valuetext stays consistent with aria-valuenow
        return valueLabel()(currentValue, max(), min());
      });

      const labelId = signal<string | undefined>(undefined);

      function setLabel(id: string) {
        labelId.set(id);
      }

      function removeLabel(id: string): void {
        // Only clear if this label is still the active one, so a newer label that has
        // taken over isn't clobbered when an old label is torn down.
        if (labelId() === id) {
          labelId.set(undefined);
        }
      }

      // Attribute bindings
      attrBinding(element, 'role', 'progressbar');
      attrBinding(element, 'id', id);
      attrBinding(element, 'aria-valuemax', max);
      attrBinding(element, 'aria-valuemin', min);
      attrBinding(element, 'aria-valuenow', valueNow);
      // omit the attribute entirely while indeterminate rather than binding an empty string
      attrBinding(element, 'aria-valuetext', () => (indeterminate() ? null : valueText()));
      attrBinding(element, 'aria-labelledby', () => (labelId() ? labelId() : null));
      dataBinding(element, 'data-progressing', () => progressing());
      dataBinding(element, 'data-indeterminate', () => indeterminate());
      dataBinding(element, 'data-complete', () => complete());

      function setMax(newMax: number): void {
        max.set(newMax);
      }

      function setMin(newMin: number): void {
        min.set(newMin);
      }

      function setValue(newValue: number | null): void {
        value.set(newValue);
      }

      return {
        max: deprecatedSetter(max, 'setMax'),
        min: deprecatedSetter(min, 'setMin'),
        value: deprecatedSetter(value, 'setValue'),
        labelId: deprecatedSetter(labelId, 'setLabel'),
        valueText,
        id,
        indeterminate,
        progressing,
        complete,
        setLabel,
        removeLabel,
        setValue,
        setMin,
        setMax,
      } satisfies NgpProgressState;
    },
  );
