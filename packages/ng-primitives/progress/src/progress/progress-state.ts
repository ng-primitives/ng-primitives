import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, deprecatedSetter } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { NgpProgressValueTextFn } from './progress';

export interface NgpProgressProps {
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

  /**
   * The unique identifier for the progress.
   */
  readonly id?: Signal<string>;
}

export interface NgpProgressState
  extends Required<Pick<NgpProgressProps, 'value' | 'min' | 'max' | 'id'>> {
  /**
   * Get the progress value text.
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
}

export const [NgpProgressStateToken, ngpProgress, injectProgressState, provideProgressState] =
  createPrimitive(
    'NgpProgress',
    ({
      valueLabel = signal((value, max) => `${Math.round((value / max) * 100)}%`),
      value = signal(null),
      min = signal(0),
      max = signal(100),
      id = signal(uniqueId('ngp-progress')),
    }: NgpProgressProps) => {
      const element = injectElementRef();

      /**
       * Determine if the progress is indeterminate.
       * @internal
       */
      const indeterminate = computed(() => value() === null);

      /**
       * Determine if the progress is in a progressing state.
       */
      const progressing = computed(() => value() != null && value()! > 0 && value()! < max());

      /**
       * Determine if the progress is complete.
       */
      const complete = computed(() => !!(value() && max() && value() === max()));

      /**
       * Get the progress value text.
       */
      const valueText = computed(() => {
        const currentValue = value();

        if (currentValue == null) {
          return '';
        }

        return valueLabel()(currentValue, max());
      });

      const labelId = signal<string | undefined>(undefined);

      function setLabel(id: string) {
        labelId.set(id);
      }

      // Attribute bindings
      attrBinding(element, 'role', 'progressbar');
      attrBinding(element, 'id', id);
      attrBinding(element, 'aria-valuemax', max);
      attrBinding(element, 'aria-valuemin', 0);
      attrBinding(element, 'aria-valuenow', value);
      attrBinding(element, 'aria-valuetext', valueText);
      attrBinding(element, 'aria-labelledby', () => (labelId() ? labelId() : null));
      dataBinding(element, 'data-progressing', () => progressing());
      dataBinding(element, 'data-indeterminate', () => indeterminate());
      dataBinding(element, 'data-complete', () => complete());

      return {
        max,
        min,
        labelId: deprecatedSetter(labelId, 'setLabel'),
        valueText,
        id,
        value,
        indeterminate,
        progressing,
        complete,
        setLabel,
      } satisfies NgpProgressState;
    },
  );
