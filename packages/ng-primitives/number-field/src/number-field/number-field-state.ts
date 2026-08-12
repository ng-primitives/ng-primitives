import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  controlledState,
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
   * The current value. Always finite or `null`.
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
   * Set the current value (clamped and stepped). A non-finite value is rejected rather
   * than treated as empty - this is a transition, and `null` already means empty.
   */
  setValue(value: number | null): void;
  /**
   * Set the default value used in uncontrolled mode. Like the binding it mirrors, a
   * non-finite value is treated as empty.
   */
  setDefaultValue(value: number | null): void;
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
   * The current value. When defined the number field is controlled.
   * A non-finite value (`NaN`, `±Infinity`) is treated as empty.
   */
  readonly value?: Signal<number | null | undefined>;
  /**
   * The default value for uncontrolled usage. A non-finite value (`NaN`, `±Infinity`) is treated as empty.
   */
  readonly defaultValue?: Signal<number | null>;
  /**
   * The minimum value. A non-finite value (`NaN`, `±Infinity`) is treated as unset.
   */
  readonly min?: Signal<number>;
  /**
   * The maximum value. A non-finite value (`NaN`, `±Infinity`) is treated as unset.
   */
  readonly max?: Signal<number>;
  /**
   * The step value. A non-finite value (`NaN`, `±Infinity`) falls back to `1`.
   */
  readonly step?: Signal<number>;
  /**
   * The large step value (used with Shift key). A non-finite value (`NaN`, `±Infinity`) falls back to `10`.
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

/** A non-finite value bound to a numeric option means it was never really set. */
function defaultIfNonFinite(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
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
    value: _value = signal<number | null | undefined>(undefined),
    defaultValue: _defaultValue,
    min: _min = signal(-Infinity),
    max: _max = signal(Infinity),
    step: _step = signal(1),
    largeStep: _largeStep = signal(10),
    disabled: _disabled = signal(false),
    readonly: _readonly = signal(false),
    onValueChange,
  }: NgpNumberFieldProps): NgpNumberFieldState => {
    const element = injectElementRef();
    // `controlledState` provides controlled/uncontrolled latching. The number
    // field's emit choreography (silent input commit + manual-emit fallback in
    // increment/decrement) is bespoke, so we drive emits through our own
    // emitter rather than controlledState's change observable, and always call
    // its setter with `emit: false`.
    const defaultValue = controlled(_defaultValue, null);
    const [storedValue, setValueInternal] = controlledState<number | null>({
      value: _value,
      defaultValue,
    });
    // Normalised after resolution, not on the way in, so `controlledState` keeps its
    // `undefined` sentinel - an absent binding must still mean uncontrolled.
    const value = computed(() => {
      const current = storedValue();
      return current !== null && !Number.isFinite(current) ? null : current;
    });
    // `clampAndStep` runs past `setValue`'s guard, so a non-finite bound would turn a
    // finite value into an infinity and store it.
    const min = computed(() => defaultIfNonFinite(_min(), -Infinity));
    const max = computed(() => defaultIfNonFinite(_max(), Infinity));
    const step = computed(() => defaultIfNonFinite(_step(), 1));
    const largeStep = computed(() => defaultIfNonFinite(_largeStep(), 10));
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
      // Round to nearest step. `step` is normalised to a finite value, so only its
      // sign matters here.
      if (step() > 0) {
        const base = Number.isFinite(min()) ? min() : 0;
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
      if (newValue !== null && !Number.isFinite(newValue)) return;
      const finalValue = newValue !== null ? clampAndStep(newValue) : null;
      // `clamped - base` overflows once the span exceeds Number.MAX_VALUE, so finite
      // arguments can still produce a non-finite result.
      if (finalValue !== null && !Number.isFinite(finalValue)) return;
      // Compared against the stored value, not the normalised one, so a parent holding
      // a non-finite value is still notified when a commit resolves it to `null`.
      if (finalValue === storedValue()) return;
      // `emit: false` keeps controlledState from firing its own change; we emit
      // manually below to preserve the number field's emit choreography.
      setValueInternal(finalValue, { emit: false });
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
      const base = Number.isFinite(min()) ? min() : 0;
      return Math.max(getDecimalPlaces(step()), getDecimalPlaces(base));
    }

    function increment(multiplier: number = 1): void {
      if (!canIncrement()) return;
      const valueBefore = value();
      commitPendingInputSilently();
      const valueAfterCommit = value();
      const current = valueAfterCommit ?? (Number.isFinite(min()) ? min() : 0);
      const precision = getStepPrecision();
      setValue(roundToPrecision(current + step() * multiplier, precision));
      // If the silent commit changed the value but setValue was a no-op
      // (stepped result clamped back to the committed value), emit the change
      // so the parent learns about the new value.
      if (valueBefore !== value() && valueAfterCommit === value()) {
        onValueChange?.(value());
        valueChange.emit(value());
      }
    }

    function decrement(multiplier: number = 1): void {
      if (!canDecrement()) return;
      const valueBefore = value();
      commitPendingInputSilently();
      const valueAfterCommit = value();
      const current = valueAfterCommit ?? (Number.isFinite(max()) ? max() : 0);
      const precision = getStepPrecision();
      setValue(roundToPrecision(current - step() * multiplier, precision));
      // If the silent commit changed the value but setValue was a no-op
      // (stepped result clamped back to the committed value), emit the change
      // so the parent learns about the new value.
      if (valueBefore !== value() && valueAfterCommit === value()) {
        onValueChange?.(value());
        valueChange.emit(value());
      }
    }

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setReadonly(isReadonly: boolean): void {
      readonly.set(isReadonly);
    }

    return {
      id,
      value: deprecatedSetter(value, 'setValue', setValue),
      min,
      max,
      step,
      largeStep,
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      readonly: deprecatedSetter(readonly, 'setReadonly', setReadonly),
      canIncrement,
      canDecrement,
      valueChange: valueChange.asObservable(),
      setValue,
      setDefaultValue: defaultValue.set,
      increment,
      decrement,
      setDisabled,
      setReadonly,
      registerInputCommit,
    } satisfies NgpNumberFieldState;
  },
);
