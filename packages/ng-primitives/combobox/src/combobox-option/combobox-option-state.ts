import { computed, ElementRef, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef, scrollIntoViewIfNeeded } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';
import { areAllOptionsSelected } from '../utils';

export interface NgpComboboxOptionState<T> {
  /** @internal Access the element refenerence. */
  readonly elementRef: ElementRef<HTMLElement>;
  /** The id of the option. */
  readonly id: Signal<string>;
  /** The value of the options. */
  readonly value: Signal<T | undefined>;
  /** The disabled state of the option. */
  readonly disabled: Signal<boolean>;
  /**
   * The index of the option in the combobox. This can be used to define the order of options
   * when virtual scrolling is used or when the order is not determined by DOM order.
   */
  readonly index: Signal<number | undefined>;
  /** @internal Select the option. */
  select(): void;
  /** @internal Scroll the option into view. */
  scrollIntoView(): void;
  /** @internal onDestroy callback */
  destroy(): void;
}

export interface NgpComboboxOptionProps<T> {
  /** The id of the option. */
  readonly id?: Signal<string>;
  /** The value of the option. */
  readonly value?: Signal<T | undefined>;
  /** The disabled state of the option. */
  readonly disabled?: Signal<boolean>;
  /**
   * The index of the option in the combobox. This can be used to define the order of options
   * when virtual scrolling is used or when the order is not determined by DOM order.
   */
  readonly index?: Signal<number | undefined>;
  /** Callback fired when the activated state changes. */
  readonly onActivatedChange?: (value: void) => void;
}

export const [
  NgpComboboxOptionStateToken,
  ngpComboboxOption,
  _injectComboboxOptionState,
  provideComboboxOptionState,
] = createPrimitive(
  'NgpComboboxOption',
  <T>({
    id: _id = signal<string>(uniqueId('ngp-combobox-option')),
    value: _value = signal<T | undefined>(undefined),
    disabled: _disabled = signal<boolean>(false),
    index: _index = signal<number | undefined>(undefined),
    onActivatedChange,
  }: NgpComboboxOptionProps<T>): NgpComboboxOptionState<T> => {
    const elementRef = injectElementRef<HTMLElement>();
    const comboboxState = injectComboboxState();

    const selected = computed(() => {
      const value = _value();
      const stateValue = comboboxState().value();

      // Only treat `undefined` as "no value" (allow '', 0, false).
      if (value === undefined) {
        return false;
      }

      // Handle select all functionality - only works in multiple selection mode
      if (value === 'all') {
        if (!comboboxState().multiple()) {
          return false; // Never selected in single selection mode
        }

        const selectedValues = Array.isArray(stateValue) ? stateValue : [];
        return areAllOptionsSelected(
          comboboxState().options(),
          selectedValues,
          comboboxState().compareWith(),
        );
      }

      // Only treat `undefined` as "no selection" (allow '', 0, false).
      if (stateValue === undefined) {
        return false;
      }

      if (comboboxState().multiple()) {
        return (
          Array.isArray(stateValue) && stateValue.some(v => comboboxState().compareWith()(value, v))
        );
      }

      return comboboxState().compareWith()(value, stateValue);
    });
    const active = computed(() => {
      // if the option has an index, use that to determine if it's active because this
      // is required for virtual scrolling scenarios
      const index = _index();

      if (index !== undefined) {
        return comboboxState().activeDescendantManager.index() === index;
      }

      return comboboxState().activeDescendantManager.id() === _id();
    });

    // Setup interactions
    ngpInteractions({ hover: true, press: true, disabled: _disabled });

    // Host binding
    attrBinding(elementRef, 'role', 'option');
    attrBinding(elementRef, 'id', () => _id());
    attrBinding(elementRef, 'tabindex', -1);
    attrBinding(elementRef, 'aria-selected', () => (selected() ? 'true' : null));
    dataBinding(elementRef, 'data-selected', selected);
    dataBinding(elementRef, 'data-active', active);
    dataBinding(elementRef, 'data-disabled', _disabled);

    // Event listener
    listener(elementRef, 'click', select);
    listener(elementRef, 'pointerenter', () => {
      // if we have a known index, use that to activate the option (required for virtual scrolling)
      const index = _index();

      if (index !== undefined) {
        comboboxState().activeDescendantManager.activateByIndex(index, {
          scroll: false,
          origin: 'pointer',
        });
        return;
      }

      // otherwise, activate by id
      comboboxState().activeDescendantManager.activateById(_id(), {
        scroll: false,
        origin: 'pointer',
      });
    });
    listener(elementRef, 'pointerleave', () => {
      if (comboboxState().activeDescendantManager.id() === _id()) {
        comboboxState().activeDescendantManager.reset({ origin: 'pointer' });
      }
    });

    function select(): void {
      if (_disabled()) {
        return;
      }

      onActivatedChange?.();
      comboboxState().toggleOption(_id());
    }

    function scrollIntoView(): void {
      scrollIntoViewIfNeeded(elementRef.nativeElement);
    }

    function destroy(): void {
      comboboxState().unregisterOption(state);
    }

    const state = {
      elementRef,
      id: _id,
      value: _value,
      disabled: _disabled,
      index: _index,
      select,
      scrollIntoView,
      destroy,
    } satisfies NgpComboboxOptionState<T>;

    comboboxState().registerOption(state);

    return state;
  },
);

export function injectComboboxOptionState<T>(
  options?: StateInjectionOptions,
): Signal<NgpComboboxOptionState<T>> {
  return _injectComboboxOptionState(options) as Signal<NgpComboboxOptionState<T>>;
}
