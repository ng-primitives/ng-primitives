import { computed, ElementRef, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef, scrollIntoViewIfNeeded } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  emitter,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { injectComboboxState } from '../combobox/combobox-state';
import { areAllOptionsSelected } from '../utils';

type T = any;

export interface NgpComboboxOptionState {
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
  /**
   * Event emitted when the option is activated via click or keyboard.
   * This is useful for options without values that need custom behavior.
   */
  readonly activatedChange: Observable<void>;
  /** @internal Select the option. */
  select(): void;
  /** @internal Scroll the option into view. */
  scrollIntoView(): void;
}

export interface NgpComboboxOptionProps {
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
  injectComboboxOptionState,
  provideComboboxOptionState,
] = createPrimitive(
  'NgpComboboxOption',
  ({
    id: _id = signal<string>(uniqueId('ngp-combobox-option')),
    value: _value = signal<T | undefined>(undefined),
    disabled: _disabled = signal<boolean>(false),
    index: _index = signal<number | undefined>(undefined),
    onActivatedChange,
  }: NgpComboboxOptionProps) => {
    const elementRef = injectElementRef<HTMLElement>();
    const comboboxState = injectComboboxState();

    const activatedChange = emitter<void>();
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
    ngpInteractions({ hover: true, press: true, disabled: comboboxState().disabled });

    // Host binding
    attrBinding(elementRef, 'role', 'option');
    attrBinding(elementRef, 'id', () => _id());
    attrBinding(elementRef, 'tabindex', -1);
    attrBinding(elementRef, 'aria-selected', () => selected());
    dataBinding(elementRef, 'data-selected', () => (selected() ? '' : null));
    dataBinding(elementRef, 'data-active', () => (active() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (comboboxState().disabled() ? '' : null));

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

      activatedChange.emit();
      onActivatedChange?.();
      comboboxState().toggleOption(_id());
    }

    function scrollIntoView(): void {
      scrollIntoViewIfNeeded(elementRef.nativeElement);
    }

    const state = {
      elementRef,
      id: _id,
      value: _value,
      disabled: _disabled,
      index: _index,
      activatedChange: activatedChange.asObservable(),
      select,
      scrollIntoView,
    } satisfies NgpComboboxOptionState;

    comboboxState().registerOption(state);

    onDestroy(() => {
      comboboxState().unregisterOption(state);
    });

    return state;
  },
);
