import {
  ClassProvider,
  computed,
  inject,
  InjectionToken,
  linkedSignal,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';

export const NgpControlStateManagerToken = new InjectionToken<NgpControlStateManager<unknown>>(
  'NgpControlStateManager',
);

export function provideControlState(): ClassProvider {
  return { provide: NgpControlStateManagerToken, useClass: NgpControlStateManager };
}

function injectControlManager<T>(): NgpControlStateManager<T> {
  return inject(NgpControlStateManagerToken) as NgpControlStateManager<T>;
}

/**
 * Bind the control state to the managed control state.
 * @param state
 */
export function controlState<T>(state: NgpControlBindings<T>): NgpControlState<T> {
  return injectControlManager<T>().setupState(state);
}

/**
 * Access the control state.
 */
export function injectControlState<T>(): NgpControlState<T> {
  return injectControlManager<T>().controlState();
}

interface NgpControlBindings<T> {
  /**
   * The signal that represents the user defined value of the control. This is usually the value input.
   */
  value: Signal<T>;
  /**
   * If the value signal is not using `model`, you may want to provide reference to the output that emits on value change.
   */
  valueChange?: OutputEmitterRef<T>;
  /**
   * The signal that represents the user defined disabled state of the control. This is usually the disabled input.
   */
  disabled?: Signal<boolean>;
}

export interface NgpControlState<T> {
  /**
   * The readonly signal that represents the user defined value of the control.
   */
  value: Signal<T>;
  /**
   * The readonly signal that represents the user defined disabled state of the control.
   */
  disabled: Signal<boolean>;
  /**
   * Update the value of the control when the value changes via Angular Forms.
   */
  writeValue(value: T): void;
  /**
   * Update the value of the control when the value changes via user interaction.
   */
  setValue(value: T): void;
  /**
   * Set the onChange callback for Angular Forms.
   */
  setOnChangeFn(fn: (value: T) => void): void;
  /**
   * Set the onTouched callback for Angular Forms.
   */
  setOnTouchedFn(fn: () => void): void;
  /**
   * Set the disabled state of the control.
   */
  setDisabled(disabled: boolean): void;
  /**
   * Mark the control as touched.
   */
  markAsTouched(): void;
}

export class NgpControlStateManager<T> {
  private readonly state = signal<NgpControlBindings<T>>({
    value: signal(undefined as T),
    disabled: signal(false),
  });

  /**
   * Store the current value of the control. This is usually a reference to the value input.
   */
  private readonly value = linkedSignal(() => this.state().value());

  /**
   * Store the current disabled state of the control. This is usually a reference to the disabled input.
   */
  private readonly disabled = linkedSignal(() => this.state().disabled?.() ?? false);

  /**
   * Store the onChange callback for Angular Forms.
   */
  private onChangeFn?: (value: T) => void;

  /**
   * Store the onTouched callback for Angular Forms.
   */
  private onTouchedFn?: () => void;

  readonly controlState = computed<NgpControlState<T>>(() => ({
    value: this.value,
    disabled: this.disabled,
    writeValue: (value: T) => this.value.set(value),
    setValue: (value: T) => {
      // update the internal value
      this.value.set(value);

      const valueSignal = this.state().value;

      if (isWritableSignal(valueSignal)) {
        valueSignal.set(value);
      }

      // if the valueChange output is provided, emit the value
      this.state().valueChange?.emit(value);

      // update the form control
      this.onChangeFn?.(value);
    },
    setOnChangeFn: (fn: (value: T) => void) => (this.onChangeFn = fn),
    setOnTouchedFn: (fn: () => void) => (this.onTouchedFn = fn),
    setDisabled: (disabled: boolean) => this.disabled.set(disabled),
    markAsTouched: () => this.onTouchedFn?.(),
  }));

  /**
   * @internal
   */
  setupState({ value, valueChange, disabled }: NgpControlBindings<T>): NgpControlState<T> {
    this.state.set({ value, valueChange, disabled });
    return this.controlState();
  }
}

function isWritableSignal<T>(signal: Signal<T>): signal is WritableSignal<T> {
  return 'set' in signal;
}
