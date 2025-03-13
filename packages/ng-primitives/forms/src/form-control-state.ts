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

export const NgpFormControlManagerToken = new InjectionToken<NgpFormControlManager<unknown>>(
  'NgpFormControlManager',
);

export function provideFormControlState(): ClassProvider {
  return { provide: NgpFormControlManagerToken, useClass: NgpFormControlManager };
}

function injectFormControlManager<T>(): NgpFormControlManager<T> {
  return inject(NgpFormControlManagerToken) as NgpFormControlManager<T>;
}

/**
 * Bind the control state to the form state.
 * @param state
 */
export function setupFormControlState<T>(state: NgpFormControlOptions<T>): NgpFormControlState<T> {
  return injectFormControlManager<T>().setupState(state);
}

/**
 * Access the form control state.
 */
export function injectFormControlState<T>(): NgpFormControlState<T> {
  return injectFormControlManager<T>().formState();
}

interface NgpFormControlOptions<T> {
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
  disabled: Signal<boolean>;
}

export interface NgpFormControlState<T> {
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
   * Set the disabled state of the control.
   */
  setDisabled(disabled: boolean): void;
}

export class NgpFormControlManager<T> {
  private readonly state = signal<NgpFormControlOptions<T>>({
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
  private readonly disabled = linkedSignal(() => this.state().disabled());

  /**
   * Store the onChange callback for Angular Forms.
   */
  private onChangeFn?: (value: T) => void;

  readonly formState = computed<NgpFormControlState<T>>(() => ({
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
    setDisabled: (disabled: boolean) => this.disabled.set(disabled),
  }));

  /**
   * @internal
   */
  setupState({ value, valueChange, disabled }: NgpFormControlOptions<T>): NgpFormControlState<T> {
    this.state.set({ value, valueChange, disabled });
    return this.formState();
  }
}

function isWritableSignal<T>(signal: Signal<T>): signal is WritableSignal<T> {
  return 'set' in signal;
}
