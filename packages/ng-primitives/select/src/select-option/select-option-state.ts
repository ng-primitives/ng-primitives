import { ElementRef, Signal, computed, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  attrBindingEffect,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  onMount,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

/**
 * The state for the NgpSelectOption directive.
 */
export interface NgpSelectOptionState {
  /**
   * The unique id of the option.
   */
  readonly id: Signal<string>;

  /** The value of the option. */
  readonly value: Signal<any>;

  /** The disabled state of the option. */
  readonly disabled: Signal<boolean>;

  /**
   * The element reference of the option.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /**
   * Select the option.
   * @internal
   */
  select(): void;

  /**
   * Scroll the option into view.
   * @internal
   */
  scrollIntoView(): void;
}

/**
 * The props for the NgpSelectOption state.
 */
export interface NgpSelectOptionProps {
  /**
   * The unique id of the option. If not provided, a unique id will be generated.
   */
  readonly id?: Signal<string>;

  /** @required The value of the option. */
  readonly value: Signal<any>;

  /** The disabled state of the option. */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpSelectOptionStateToken,
  ngpSelectOption,
  injectSelectOptionState,
  provideSelectOptionState,
] = createPrimitive(
  'NgpSelectOption',
  ({
    id = signal(uniqueId('ngp-select-option')),
    value,
    disabled = signal(false),
  }: NgpSelectOptionProps): NgpSelectOptionState => {
    const element = injectElementRef();
    const selectState = injectSelectState();

    const active = computed(
      () => selectState().activeDescendantManager.activeDescendant() === id(),
    );

    const selected = computed(() => {
      const optionValue = value();

      if (optionValue === undefined) {
        return false;
      }

      const selectValue = selectState().value();

      if (selectValue === undefined || selectValue === null) {
        return false;
      }

      if (selectState().multiple()) {
        return (
          Array.isArray(selectValue) &&
          selectValue.some(v => selectState().compareWith()(optionValue, v))
        );
      }

      return selectState().compareWith()(optionValue, selectValue);
    });

    const state: NgpSelectOptionState = {
      id,
      value,
      disabled,
      elementRef: element,
      select,
      scrollIntoView,
    };

    // Host bindings
    attrBindingEffect(element, 'role', 'option');
    attrBindingEffect(element, 'tabindex', -1);
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-selected', () => (selected() ? 'true' : null));
    dataBinding(element, 'data-selected', selected);
    dataBinding(element, 'data-active', active);
    dataBinding(element, 'data-disabled', disabled);

    // Event listeners
    listener(element, 'click', select);
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    // Setup interactions
    ngpInteractions({
      hover: true,
      press: true,
      disabled,
    });

    onMount(() => {
      // we can't use a required input for value as it is used in computed properties before the input is set
      if (value() === undefined) {
        throw new Error(
          'ngpSelectOption: The value input is required. Please provide a value for the option.',
        );
      }

      selectState().registerOption(state);
    });

    onDestroy(() => {
      selectState().unregisterOption(state);
    });

    function select(): void {
      if (disabled()) {
        return;
      }

      selectState().toggleOption(state);
    }

    function scrollIntoView(): void {
      element.nativeElement.scrollIntoView({ block: 'nearest' });
    }

    function onPointerEnter(): void {
      selectState().activeDescendantManager.activate(state);
    }

    function onPointerLeave(): void {
      selectState().activeDescendantManager.activate(undefined);
    }

    return state;
  },
);
