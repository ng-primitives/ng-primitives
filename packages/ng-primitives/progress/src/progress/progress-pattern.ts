import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';

export type NgpProgressValueTextFn = (value: number, max: number) => string;

export interface NgpProgressState {
  /**
   * The value of the progress.
   */
  value: Signal<number | null>;
  /**
   * The minimum value of the progress.
   */
  min: Signal<number>;
  /**
   * The maximum value of the progress.
   */
  max: Signal<number>;
  /**
   * The value label function.
   */
  valueLabel: Signal<NgpProgressValueTextFn>;
  /**
   * Whether the progress is indeterminate.
   */
  indeterminate: Signal<boolean>;
  /**
   * Whether the progress is in a progressing state.
   */
  progressing: Signal<boolean>;
  /**
   * Whether the progress is complete.
   */
  complete: Signal<boolean>;
  /**
   * The progress value text.
   */
  valueText: Signal<string>;
}

export interface NgpProgressProps {
  /**
   * The value of the progress.
   */
  value: Signal<number | null>;
  /**
   * The minimum value of the progress.
   */
  min: Signal<number>;
  /**
   * The maximum value of the progress.
   */
  max: Signal<number>;
  /**
   * The value label function.
   */
  valueLabel: Signal<NgpProgressValueTextFn>;

  /**
   * The id of the progress label.
   */
  labelId: Signal<string | null>;

  element?: ElementRef<HTMLElement>;
}

export function ngpProgressPattern({
  value,
  min,
  max,
  valueLabel,
  labelId,
  element = injectElementRef(),
}: NgpProgressProps): NgpProgressState {
  const indeterminate = computed(() => value() === null);

  const progressing = computed(() => {
    const val = value();
    return val != null && val > 0 && val < max();
  });

  const complete = computed(() => value() === max());

  const valueText = computed(() => {
    const val = value();
    if (val == null) {
      return '';
    }
    return valueLabel()(val, max());
  });

  // Setup host attribute bindings
  attrBinding(element, 'role', () => 'progressbar');
  attrBinding(element, 'aria-valuemax', () => String(max()));
  attrBinding(element, 'aria-valuemin', () => '0');
  attrBinding(element, 'aria-valuenow', () => (value() != null ? String(value()) : null));
  attrBinding(element, 'aria-valuetext', () => valueText() || null);
  attrBinding(element, 'aria-labelledby', () => labelId() ?? null);

  // Setup data attribute bindings
  dataBinding(element, 'data-progressing', progressing);
  dataBinding(element, 'data-indeterminate', indeterminate);
  dataBinding(element, 'data-complete', complete);

  return {
    value,
    min,
    max,
    valueLabel,
    indeterminate,
    progressing,
    complete,
    valueText,
  };
}

export const NgpProgressPatternToken = new InjectionToken<NgpProgressState>(
  'NgpProgressPatternToken',
);

export function injectProgressPattern(): NgpProgressState {
  return inject(NgpProgressPatternToken);
}

export function provideProgressPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpProgressState,
): FactoryProvider {
  return { provide: NgpProgressPatternToken, useFactory: () => fn(inject(type)) };
}
