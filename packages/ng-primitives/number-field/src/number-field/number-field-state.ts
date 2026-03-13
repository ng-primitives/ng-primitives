import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';

/**
 * Public state surface for the NumberField primitive.
 */
export interface NgpNumberFieldState {
  /**
   * The id of the number field.
   */
  readonly id: Signal<string>;
  /**
   * The current value.
   */
  readonly value: WritableSignal<number | null>;
  /**
   * The minimum value.
   */
  readonly min: Signal<number>;
  /**
   * The maximum value.
   */
  readonly max: Signal<number>;
  /**
   * The step value.
   */
  readonly step: Signal<number>;
  /**
   * The large step value (used with Shift key).
   */
  readonly largeStep: Signal<number>;
  /**
   * Whether the number field is disabled (includes form control state).
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Whether the number field is readonly.
   */
  readonly readonly: WritableSignal<boolean>;
  /**
   * Whether the increment button should be disabled.
   */
  readonly canIncrement: Signal<boolean>;
  /**
   * Whether the decrement button should be disabled.
   */
  readonly canDecrement: Signal<boolean>;
  /**
   * Emit when the value changes.
   */
  readonly valueChange: Observable<number | null>;
  /**
   * Set the current value (clamped and stepped).
   */
  setValue(value: number | null): void;
  /**
   * Increment the value by one step.
   */
  increment(multiplier?: number): void;
  /**
   * Decrement the value by one step.
   */
  decrement(multiplier?: number): void;
  /**
   * Set the disabled state.
   */
  setDisabled(disabled: boolean): void;
  /**
   * Set the readonly state.
   */
  setReadonly(readonly: boolean): void;
  /** @internal */
  registerInputCommit(commitFn: () => void): void;
}

/**
 * Inputs for configuring the NumberField primitive.
 */
export interface NgpNumberFieldProps {
  /**
   * The id of the number field.
   */
  readonly id?: Signal<string>;
  /**
   * The current value.
   */
  readonly value?: Signal<number | null>;
  /**
   * The minimum value.
   */
  readonly min?: Signal<number>;
  /**
   * The maximum value.
   */
  readonly max?: Signal<number>;
  /**
   * The step value.
   */
  readonly step?: Signal<number>;
  /**
   * The large step value (used with Shift key).
   */
  readonly largeStep?: Signal<number>;
  /**
   * Whether the number field is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Whether the number field is readonly.
   */
  readonly readonly?: Signal<boolean>;
  /**
   * Callback fired when the value changes.
   */
  readonly onValueChange?: (value: number | null) => void;
}

export const [
  NgpNumberFieldStateToken,
  ngpNumberField,
  injectNumberFieldState,
  provideNumberFieldState,
] = createPrimitive(
  'NgpNumberField',
  ({
    id = signal(uniqueId('ngp-number-field')),
    value: _value = signal<number | null>(null),
    min = signal(-Infinity),
    max = signal(Infinity),
    step = signal(1),
    largeStep: _largeStep = signal(10),
    disabled: _disabled = signal(false),
    readonly: _readonly = signal(false),
    onValueChange,
  }: NgpNumberFieldProps): NgpNumberFieldState => {
    const element = injectElementRef();
    const value = controlled(_value);
    const disabled = controlled(_disabled);
    const readonly = controlled(_readonly);

    const valueChange = emitter<number | null>();

    const canIncrement = computed(() => {
      if (disabled() || readonly()) return false;
      if (value() === null) return true;
      return value()! < max();
    });

    const canDecrement = computed(() => {
      if (disabled() || readonly()) return false;
      if (value() === null) return true;
      return value()! > min();
    });

    // Host bindings
    attrBinding(element, 'role', () => 'group');
    dataBinding(element, 'data-disabled', disabled);
    dataBinding(element, 'data-readonly', readonly);

    /**
     * Count the number of decimal places in a number.
     */
    function getDecimalPlaces(n: number): number {
      const str = String(n);
      const dotIndex = str.indexOf('.');
      return dotIndex === -1 ? 0 : str.length - dotIndex - 1;
    }

    /**
     * Round a number to a specific number of decimal places to avoid
     * floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004).
     */
    function roundToPrecision(val: number, precision: number): number {
      if (precision === 0) return Math.round(val);
      return parseFloat(val.toFixed(precision));
    }

    function clampAndStep(val: number): number {
      const clamped = Math.min(max(), Math.max(min(), val));
      // Round to nearest step
      if (isFinite(step()) && step() > 0) {
        const base = isFinite(min()) ? min() : 0;
        const precision = Math.max(getDecimalPlaces(step()), getDecimalPlaces(base));
        const stepped = roundToPrecision(
          Math.round((clamped - base) / step()) * step() + base,
          precision,
        );
        return Math.min(max(), Math.max(min(), stepped));
      }
      return clamped;
    }

    let suppressEmit = false;

    function setValue(newValue: number | null): void {
      if (disabled() || readonly()) return;
      if (newValue !== null && isNaN(newValue)) return;
      const finalValue = newValue !== null ? clampAndStep(newValue) : null;
      // Skip emit when value is unchanged
      if (finalValue === value()) return;
      value.set(finalValue);
      if (!suppressEmit) {
        onValueChange?.(finalValue);
        valueChange.emit(finalValue);
      }
    }

    let inputCommitFn: (() => void) | null = null;

    function registerInputCommit(commitFn: () => void): void {
      inputCommitFn = commitFn;
    }

    /**
     * Commit any pending input value without emitting change events.
     * This ensures increment/decrement operates on the displayed value
     * while only emitting the final stepped result.
     */
    function commitPendingInputSilently(): void {
      if (!inputCommitFn) return;
      suppressEmit = true;
      try {
        inputCommitFn();
      } finally {
        suppressEmit = false;
      }
    }

    function getStepPrecision(): number {
      const base = isFinite(min()) ? min() : 0;
      return Math.max(getDecimalPlaces(step()), getDecimalPlaces(base));
    }

    function increment(multiplier: number = 1): void {
      if (!canIncrement()) return;
      commitPendingInputSilently();
      const current = value() ?? (isFinite(min()) ? min() : 0);
      const precision = getStepPrecision();
      setValue(roundToPrecision(current + step() * multiplier, precision));
    }

    function decrement(multiplier: number = 1): void {
      if (!canDecrement()) return;
      commitPendingInputSilently();
      const current = value() ?? (isFinite(max()) ? max() : 0);
      const precision = getStepPrecision();
      setValue(roundToPrecision(current - step() * multiplier, precision));
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setReadonly(isReadonly: boolean): void {
      readonly.set(isReadonly);
    }

    return {
      id,
      value,
      min,
      max,
      step,
      largeStep: _largeStep,
      disabled: deprecatedSetter(disabled, 'setDisabled'),
      readonly: deprecatedSetter(readonly, 'setReadonly'),
      canIncrement,
      canDecrement,
      valueChange: valueChange.asObservable(),
      setValue,
      increment,
      decrement,
      setDisabled,
      setReadonly,
      registerInputCommit,
    } satisfies NgpNumberFieldState;
  },
);
