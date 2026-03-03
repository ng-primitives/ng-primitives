import { computed, ElementRef, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  attrBindingEffect,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

export interface NgpSelectOptionState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** The id of the option. */
  readonly id: Signal<string>;

  /** The value of the option. */
  readonly value: Signal<any>;

  /** The disabled state of the option. */
  readonly disabled: Signal<boolean>;

  /** The index of the option in the list. */
  readonly index: Signal<number | undefined>;

  /**
   * Whether this option is the active descendant.
   * @internal
   */
  readonly active: Signal<boolean>;

  /**
   * Whether this option is selected.
   * @internal
   */
  readonly selected: Signal<boolean>;

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

  /**
   * Activate on pointer enter.
   * @internal
   */
  activateOnPointerEnter(): void;

  /**
   * Deactivate on pointer leave.
   * @internal
   */
  deactivateOnPointerLeave(): void;

  /**
   * Emit activated event.
   * @internal
   */
  emitActivated(): void;
}

export interface NgpSelectOptionProps {
  /** The id of the option. */
  readonly id?: Signal<string>;

  /** The value of the option. */
  readonly value?: Signal<any>;

  /** The disabled state of the option. */
  readonly disabled?: Signal<boolean>;

  /** The index of the option in the list. */
  readonly index?: Signal<number | undefined>;

  /** Callback when option is activated. */
  readonly onActivated?: () => void;
}

export const [
  NgpSelectOptionStateToken,
  ngpSelectOption,
  _injectSelectOptionState,
  provideSelectOptionState,
] = createPrimitive(
  'NgpSelectOption',
  ({
    id: _id = signal(uniqueId('ngp-select-option')),
    value: _value = signal<any>(undefined),
    disabled: _disabled = signal<boolean>(false),
    index: _index = signal<number | undefined>(undefined),
    onActivated,
  }: NgpSelectOptionProps) => {
    const elementRef = injectElementRef<HTMLElement>();
    const selectState = injectSelectState();

    const id = controlled(_id);
    const value = controlled(_value);
    const disabled = controlled(_disabled);
    const index = controlled(_index);

    ngpInteractions({
      hover: true,
      press: true,
      disabled: disabled,
    });
    // Computed states
    const active = computed(() => {
      const idx = index();

      if (idx !== undefined) {
        return selectState().activeDescendantManager.index() === idx;
      }

      return selectState().activeDescendantManager.id() === id();
    });

    const selected = computed(() => {
      const val = value();
      const stateValue = selectState().value();

      if (val === undefined) {
        return false;
      }

      if (selectState().multiple()) {
        return (
          Array.isArray(stateValue) && stateValue.some(v => selectState().compareWith()(val, v))
        );
      }

      if (stateValue === undefined) {
        return false;
      }

      return selectState().compareWith()(val, stateValue);
    });

    // Host bindings
    attrBindingEffect(elementRef, 'role', 'option');
    attrBindingEffect(elementRef, 'tabindex', -1);
    attrBindingEffect(elementRef, 'id', id);
    attrBinding(elementRef, 'aria-selected', () => (selected() ? 'true' : undefined));
    dataBinding(elementRef, 'data-selected', () => (selected() ? '' : null));
    dataBinding(elementRef, 'data-active', () => (active() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (disabled() ? '' : null));

    // Event listeners
    listener(elementRef, 'click', () => select());
    listener(elementRef, 'pointerenter', () => activateOnPointerEnter());
    listener(elementRef, 'pointerleave', () => deactivateOnPointerLeave());

    // Methods
    function select(): void {
      if (disabled()) {
        return;
      }

      onActivated?.();
      selectState().toggleOption(id());
    }

    function scrollIntoView(): void {
      elementRef.nativeElement.scrollIntoView({ block: 'nearest' });
    }

    function activateOnPointerEnter(): void {
      const idx = index();

      if (idx !== undefined) {
        selectState().activeDescendantManager.activateByIndex(idx, {
          scroll: false,
          origin: 'pointer',
        });
        return;
      }

      selectState().activeDescendantManager.activateById(id(), {
        scroll: false,
        origin: 'pointer',
      });
    }

    function deactivateOnPointerLeave(): void {
      if (selectState().activeDescendantManager.id() === id()) {
        selectState().activeDescendantManager.reset({ origin: 'pointer' });
      }
    }

    return {
      elementRef,
      id,
      value,
      disabled,
      index,
      active,
      selected,
      select,
      scrollIntoView,
      activateOnPointerEnter,
      deactivateOnPointerLeave,
      emitActivated: () => onActivated?.(),
    } satisfies NgpSelectOptionState;
  },
);

export function injectSelectOptionState(): Signal<NgpSelectOptionState> {
  return _injectSelectOptionState() as Signal<NgpSelectOptionState>;
}
