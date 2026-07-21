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
   * The id of the listbox.
   */
  readonly id?: Signal<string>;
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
   * Whether the option is disabled - this is used by the `Highlightable` interface.
   */
  readonly disabled: boolean;
  /**
   * @internal
   * Sets the active state of the option - used by the `Highlightable` interface.
   */
  setActiveStyles: () => void;
  /**
   * @internal
   * Sets the inactive state of the option - used by the `Highlightable` interface.
   */
  setInactiveStyles: () => void;
  /**
   * @internal
   * Gets the label of the option, used by the `Highlightable` interface.
   */
  getLabel: () => string;
  /**
   * @internal
   * Selects the option.
   */
  select: (origin: FocusOrigin) => void;
}

export interface NgpListboxOptionProps<T> {
  /**
   * The id of the listbox.
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

    const active = signal<boolean>(false);
    const selected = computed(() => listboxState()?.isSelected(value()));

    // the option is disabled if it is explicitly disabled or the whole listbox is disabled
    const disabled = computed(() => _disabled() || (listboxState()?.disabled() ?? false));

    // Setup interactions
    ngpInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      focus: true,
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

    function setActiveStyles(): void {
      active.set(true);
      scrollIntoViewIfNeeded(elementRef.nativeElement);
    }

    function setInactiveStyles(): void {
      active.set(false);
    }

    function getLabel(): string {
      return elementRef.nativeElement.textContent ?? '';
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
      get disabled(): boolean {
        return disabled();
      },
      setActiveStyles,
      setInactiveStyles,
      getLabel,
      select,
    } satisfies NgpListboxOptionState<T>;

    // the listbox may not be available when the option is initialized, so add the
    // option once the listbox is available
    effect(() => listboxState()?.addOption(state));

    onDestroy(() => listboxState()?.removeOption(state));

    // if the element is removed from the DOM, deregister it and reset its active state
    onDomRemoval(elementRef.nativeElement, () => {
      listboxState()?.removeOption(state);
      setInactiveStyles();
    });

    return state;
  },
);
