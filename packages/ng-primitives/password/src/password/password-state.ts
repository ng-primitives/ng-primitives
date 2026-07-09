import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';

/**
 * Public state surface for the Password primitive.
 */
export interface NgpPasswordState {
  /**
   * Whether the password is currently visible.
   */
  readonly visible: WritableSignal<boolean>;
  /**
   * Emits when the visibility state changes.
   */
  readonly visibleChange: Observable<boolean>;
  /**
   * The id of the registered input, used to wire up `aria-controls`.
   * @internal
   */
  readonly inputId: Signal<string | null>;
  /**
   * Toggle the visibility state.
   */
  toggle(): void;
  /**
   * Set the visibility state.
   */
  setVisible(value: boolean, options?: SetterOptions): void;
  /**
   * Set the default visibility state.
   */
  setDefaultVisible(value: boolean): void;
  /**
   * Register the password input with the container.
   * @internal
   */
  registerInput(input: HTMLInputElement, id: Signal<string>): void;
  /**
   * Focus the registered input.
   * @internal
   */
  focusInput(): void;
}

/**
 * Inputs for configuring the Password primitive.
 */
export interface NgpPasswordProps {
  /**
   * Whether the password is visible.
   */
  readonly visible: Signal<boolean | undefined>;
  /**
   * The default visibility state for uncontrolled usage.
   */
  readonly defaultVisible?: Signal<boolean>;
  /**
   * Callback fired when the visibility state changes.
   */
  readonly onVisibleChange?: (visible: boolean) => void;
}

export const [NgpPasswordStateToken, ngpPassword, injectPasswordState, providePasswordState] =
  createPrimitive(
    'NgpPassword',
    ({
      visible: _visible,
      defaultVisible: _defaultVisible,
      onVisibleChange,
    }: NgpPasswordProps): NgpPasswordState => {
      const element = injectElementRef<HTMLElement>();
      const defaultVisible = controlled(_defaultVisible, false);

      const input = signal<HTMLInputElement | null>(null);
      const inputId = signal<Signal<string> | null>(null);

      const [visible, setVisible, visibleChange] = controlledState({
        value: _visible,
        defaultValue: defaultVisible,
        onChange: onVisibleChange,
      });

      dataBinding(element, 'data-visible', visible);

      function toggle(): void {
        setVisible(!visible());
      }

      function registerInput(el: HTMLInputElement, id: Signal<string>): void {
        input.set(el);
        inputId.set(id);
      }

      function focusInput(): void {
        input()?.focus();
      }

      return {
        visible: deprecatedSetter(visible, 'setVisible', setVisible),
        visibleChange,
        inputId: computed(() => inputId()?.() ?? null),
        toggle,
        setVisible,
        setDefaultVisible: defaultVisible.set,
        registerInput,
        focusInput,
      } satisfies NgpPasswordState;
    },
  );
