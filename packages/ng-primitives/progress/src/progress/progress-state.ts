import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, attrBinding, dataBinding } from 'ng-primitives/state';
import { NgpProgressLabelProps } from '../progress-label/progress-label-state';
import { NgpProgressValueTextFn } from './progress';

export interface NgpProgressProps {
  /**
   * Define the progress value.
   */
  readonly value: Signal<number | null>;

  /**
   * Define the progress min value.
   * @default '0'
   */
  readonly min: Signal<number>;

  /**
   * Define the progress max value.
   * @default 100
   */
  readonly max: Signal<number>;

  /**
   * Define a function that returns the progress value label.
   * @param value The current value
   * @param max The maximum value
   * @returns The value label
   */
  readonly valueLabel: Signal<NgpProgressValueTextFn>;

  /**
   * The unique identifier for the progress.
   */
  readonly id: Signal<string>;
}

export interface NgpProgressState extends NgpProgressProps {
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
   * Get the progress value text.
   */
  readonly valueText: Signal<string>;

  /**
   * The label associated with the progress bar.
   * @internal
   */
  readonly label: Signal<NgpProgressLabelProps | null>;
}

export const [NgpProgressStateToken, ngpProgress, injectProgressState, provideProgressState] =
  createPrimitive('NgpProgress', ({ valueLabel, value, min, max, id }: NgpProgressProps) => {
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

    const label = signal<NgpProgressLabelProps | null>(null);

    // Attribute bindings
    attrBinding(element, 'role', 'progressbar');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-valuemax', max);
    attrBinding(element, 'aria-valuemin', 0);
    attrBinding(element, 'aria-valuenow', value);
    attrBinding(element, 'aria-valuetext', valueText);
    attrBinding(element, 'aria-labelledby', () => (label() ? label()?.id() : null));
    dataBinding(element, 'data-progressing', () => (progressing() ? '' : null));
    dataBinding(element, 'data-indeterminate', () => (indeterminate() ? '' : null));
    dataBinding(element, 'data-complete', () => (complete() ? '' : null));
    // Return public API
    return {
      max,
      min,
      label,
      indeterminate,
      progressing,
      complete,
      valueText,
      id,
      value,
      valueLabel,
    } satisfies NgpProgressState;
  });
