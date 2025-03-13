import {
  ClassProvider,
  computed,
  inject,
  InjectionToken,
  linkedSignal,
  signal,
  Signal,
} from '@angular/core';
import { Subject } from 'rxjs';

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
  value: Signal<T>;
  disabled: Signal<boolean>;
}

export interface NgpFormControlState<T> {
  value: Signal<T>;
  disabled: Signal<boolean>;
  valueChange: Subject<T>;
  setValue(value: T): void;
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
   * An observable that emits when the value of the control changes due to user input.
   */
  private readonly valueChange = new Subject<T>();

  readonly formState = computed<NgpFormControlState<T>>(() => ({
    value: this.value,
    disabled: this.disabled,
    valueChange: this.valueChange,
    setValue: (value: T) => {
      this.value.set(value);
      this.valueChange.next(value);
    },
    setDisabled: (disabled: boolean) => this.disabled.set(disabled),
  }));

  /**
   * @internal
   */
  setupState({ value, disabled }: NgpFormControlOptions<T>): NgpFormControlState<T> {
    this.state.set({ value, disabled });
    return this.formState();
  }
}
