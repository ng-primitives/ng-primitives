import { Signal, signal, WritableSignal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
  listener,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';

/**
 * Public state surface for the Toggle primitive.
 */
export interface NgpToggleState {
  /**
   * Whether the toggle is selected.
   */
  readonly selected: WritableSignal<boolean>;
  /**
   * Whether the toggle is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * Emits when the selected state changes.
   */
  readonly selectedChange: Observable<boolean>;
  /**
   * Toggle the selected state.
   */
  toggle(event?: Event): void;
  /**
   * Set the selected state.
   */
  setSelected(value: boolean): void;
  /**
   * Set the disabled state.
   */
  setDisabled(value: boolean): void;
}

/**
 * Inputs for configuring the Toggle primitive.
 */
export interface NgpToggleProps {
  /**
   * Whether the toggle is selected.
   */
  readonly selected?: Signal<boolean>;
  /**
   * Whether the toggle is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback fired when the selected state changes.
   */
  readonly onSelectedChange?: (selected: boolean) => void;
}

export const [NgpToggleStateToken, ngpToggle, injectToggleState, provideToggleState] =
  createPrimitive(
    'NgpToggle',
    ({
      selected: _selected = signal(false),
      disabled: _disabled = signal(false),
      onSelectedChange,
    }: NgpToggleProps): NgpToggleState => {
      const element = injectElementRef<HTMLElement>();
      const selected = controlled(_selected);
      const disabled = controlled(_disabled);

      const selectedChange = emitter<boolean>();

      ngpButton({ disabled, type: 'button' });

      // Host bindings
      attrBinding(element, 'aria-pressed', selected);
      dataBinding(element, 'data-selected', selected);

      // Listeners
      listener(element, 'click', () => setSelected(!selected()));

      function setSelected(value: boolean): void {
        selected.set(value);
        onSelectedChange?.(value);
        selectedChange.emit(value);
      }

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      return {
        selected: deprecatedSetter(selected, 'setSelected'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        selectedChange: selectedChange.asObservable(),
        toggle: () => element.nativeElement.click(),
        setSelected,
        setDisabled,
      } satisfies NgpToggleState;
    },
  );
