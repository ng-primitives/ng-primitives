import { computed, ElementRef, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef, scrollIntoViewIfNeeded } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

export interface NgpAutocompleteOptionState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** The id of the option. */
  readonly id: Signal<string>;

  /** The value of the option. */
  readonly value: Signal<T>;

  /** Whether the option is disabled. */
  readonly disabled: Signal<boolean>;

  /** The index of the option, when the order is not the DOM order. */
  readonly index: Signal<number | undefined>;

  /**
   * Select the option, as a click or Enter does.
   * @internal
   */
  select(): void;

  /**
   * Scroll the option into view.
   * @internal
   */
  scrollIntoView(): void;
}

export interface NgpAutocompleteOptionProps {
  /** The id of the option. */
  readonly id?: Signal<string>;

  /** The value of the option. */
  readonly value?: Signal<T>;

  /** Whether the option is disabled. */
  readonly disabled?: Signal<boolean>;

  /** The index of the option, when the order is not the DOM order. */
  readonly index?: Signal<number | undefined>;

  /** Called when the option is activated. */
  readonly onActivated?: () => void;
}

export const [
  NgpAutocompleteOptionStateToken,
  ngpAutocompleteOption,
  injectAutocompleteOptionState,
  provideAutocompleteOptionState,
] = createPrimitive(
  'NgpAutocompleteOption',
  ({
    id = signal(uniqueId('ngp-autocomplete-option')),
    value = signal<T>(undefined),
    disabled = signal(false),
    index = signal<number | undefined>(undefined),
    onActivated,
  }: NgpAutocompleteOptionProps): NgpAutocompleteOptionState => {
    const elementRef = injectElementRef<HTMLElement>();
    const state = injectAutocompleteState();

    ngpInteractions({
      hover: true,
      press: true,
      disabled,
    });

    const active = computed(() => {
      // with virtual scrolling the option is identified by its index, not its id
      const optionIndex = index();

      if (optionIndex !== undefined) {
        return state().activeDescendantManager.index() === optionIndex;
      }

      return state().activeDescendantManager.id() === id();
    });

    const selected = computed(() => state().isOptionSelected(value()));

    // Host bindings
    attrBinding(elementRef, 'role', 'option');
    attrBinding(elementRef, 'id', id);
    attrBinding(elementRef, 'tabindex', -1);
    // In ARIA terms the active option is the selected one. `data-selected` marks the consumer's value.
    attrBinding(elementRef, 'aria-selected', () => (active() ? 'true' : null));
    dataBinding(elementRef, 'data-selected', selected);
    dataBinding(elementRef, 'data-active', active);
    dataBinding(elementRef, 'data-disabled', disabled);

    // Event listeners
    listener(elementRef, 'click', () => select());
    // the option can take focus, so a press would pull it from the element that drives the list
    listener(elementRef, 'mousedown', event => event.preventDefault());
    listener(elementRef, 'pointerenter', onPointerEnter);
    listener(elementRef, 'pointerleave', onPointerLeave);

    function select(): void {
      if (disabled()) {
        return;
      }

      onActivated?.();
      state().selectOption(optionState);
    }

    function scrollIntoView(): void {
      scrollIntoViewIfNeeded(elementRef.nativeElement);
    }

    function onPointerEnter(): void {
      const optionIndex = index();

      if (optionIndex !== undefined) {
        state().activeDescendantManager.activateByIndex(optionIndex, {
          scroll: false,
          origin: 'pointer',
        });
        return;
      }

      state().activeDescendantManager.activateById(id(), {
        scroll: false,
        origin: 'pointer',
      });
    }

    function onPointerLeave(): void {
      if (state().activeDescendantManager.id() === id()) {
        state().activeDescendantManager.reset({ origin: 'pointer' });
      }
    }

    const optionState = {
      elementRef,
      id,
      value,
      disabled,
      index,
      select,
      scrollIntoView,
    } satisfies NgpAutocompleteOptionState;

    state().registerOption(optionState);
    onDestroy(() => state().unregisterOption(optionState));

    return optionState;
  },
);
