import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, effect, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef, onDomRemoval, scrollIntoViewIfNeeded } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectListboxState } from '../listbox/listbox-state';

export interface NgpListboxOptionState<T> {
  /**
   * The id of the option.
   */
  readonly id: Signal<string>;
  /**
   * The value of the option.
   */
  readonly value: Signal<T>;
  /**
   * @internal
   * Whether the option is selected.
   */
  readonly selected: Signal<boolean | undefined>;
  /**
   * @internal
   * Whether the option is disabled (its own disabled state or the listbox's).
   */
  readonly disabled: Signal<boolean>;
  /**
   * @internal
   * Gets the label of the option, used for typeahead.
   */
  getLabel: () => string;
  /**
   * @internal
   * Scrolls the option into view when it becomes the active descendant.
   */
  scrollIntoView: () => void;
  /**
   * @internal
   * Selects the option.
   */
  select: (origin: FocusOrigin) => void;
}

export interface NgpListboxOptionProps<T> {
  /**
   * The id of the option.
   */
  readonly id?: Signal<string>;
  /**
   * The value of the option.
   */
  readonly value: Signal<T>;
  /**
   * Whether the option is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpListboxOptionStateToken,
  ngpListboxOption,
  injectListboxOptionState,
  provideListboxOptionState,
] = createPrimitive(
  'NgpListboxOption',
  <T>({
    id = signal(uniqueId('ngp-listbox-option')),
    value,
    disabled: _disabled = signal<boolean>(false),
  }: NgpListboxOptionProps<T>) => {
    const elementRef = injectElementRef();
    const listboxState = injectListboxState<T>();

    const selected = computed(() => listboxState()?.isSelected(value()));

    // the option is disabled if it is explicitly disabled or the whole listbox is disabled
    const disabled = computed(() => _disabled() || (listboxState()?.disabled() ?? false));

    // the option is the active descendant when the listbox's manager points at its id
    const active = computed(() => listboxState()?.activeDescendantManager.id() === id());

    // Setup interactions. Options never receive DOM focus - the listbox uses the
    // active-descendant pattern, so keyboard focus stays on the container and the
    // active option is reflected via `data-active`. Requesting focus/focusVisible
    // here would only add attributes that can never appear.
    ngpInteractions({
      hover: true,
      press: true,
      disabled,
    });

    // Host binding
    attrBinding(elementRef, 'role', 'option');
    attrBinding(elementRef, 'id', id);
    attrBinding(elementRef, 'aria-disabled', disabled);
    dataBinding(elementRef, 'data-disabled', () => (disabled() ? '' : null));
    dataBinding(elementRef, 'data-active', () =>
      listboxState()?.isFocused() && active() ? '' : null,
    );
    dataBinding(elementRef, 'data-selected', () => (selected() ? '' : null));

    // Listener
    listener(elementRef, 'mouseenter', activate);
    listener(elementRef, 'click', () => select('mouse'));
    listener(elementRef, 'keydown.enter', () => select('keyboard'));
    listener(elementRef, 'keydown.space', () => select('keyboard'));

    function getLabel(): string {
      return elementRef.nativeElement.textContent ?? '';
    }

    function scrollIntoView(): void {
      scrollIntoViewIfNeeded(elementRef.nativeElement);
    }

    function select(origin: FocusOrigin): void {
      if (disabled()) {
        return;
      }

      listboxState()?.selectOption(value(), origin);
    }

    function activate(): void {
      if (disabled()) {
        return;
      }

      listboxState()?.activateOption(value());
    }

    const state = {
      id,
      value,
      selected,
      disabled,
      getLabel,
      scrollIntoView,
      select,
    } satisfies NgpListboxOptionState<T>;

    // the listbox may not be available when the option is initialized, so add the
    // option once the listbox is available
    effect(() => listboxState()?.addOption(state));

    onDestroy(() => listboxState()?.removeOption(state));

    // if the element is removed from the DOM, deregister it
    onDomRemoval(elementRef.nativeElement, () => listboxState()?.removeOption(state));

    return state;
  },
);
