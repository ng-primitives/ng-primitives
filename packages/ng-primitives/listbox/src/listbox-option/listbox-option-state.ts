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
  StateInjectionOptions,
} from 'ng-primitives/state';
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
   * Whether the option is disabled.
   */
  readonly optionDisabled?: Signal<boolean>;
  /**
   * Whether the option is active.
   */
  readonly active?: Signal<boolean>;
  /**
   * @internal
   * Whether the option is selected.
   */
  readonly selected: Signal<boolean | undefined>;
  /**
   * @internal
   * Whether the option is disabled - this is used by the `Highlightable` interface.
   */
  disabled: boolean;
  /**
   * Whether the option is disabled.
   */
  _disabled: Signal<boolean>;
  /**
   * @internal
   * Sets the active state of the option.
   */
  setActiveStyles: () => void;
  /**
   * @internal
   * Sets the inactive state of the option.
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
  /**
   * @internal
   * Activate the current options.
   */
  activate: () => void;
  destroy: () => void;
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
  readonly optionDisabled?: Signal<boolean>;
}

export const [
  NgpListboxOptionStateToken,
  ngpListboxOption,
  injectListboxOptionState,
  provideListboxOptionState,
] = createPrimitive(
  'NgpListboxOption',
  <T>({
    id = signal<string>(''),
    value,
    optionDisabled = signal<boolean>(false),
  }: NgpListboxOptionProps<T>) => {
    const elementRef = injectElementRef();
    const listboxState = injectListboxState<T>();

    const active = signal<boolean>(false);
    const selected = computed(() => listboxState()?.isSelected(value()));

    const _disabled = computed(() => optionDisabled() || (listboxState()?.disabled() ?? false));

    // Setup interactions
    ngpInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      focus: true,
      disabled: _disabled,
    });

    // Host binding
    attrBinding(elementRef, 'role', 'option');
    attrBinding(elementRef, 'id', () => id());
    attrBinding(elementRef, 'aria-disabled', () => optionDisabled());
    dataBinding(elementRef, 'data-disabled', () => (optionDisabled() ? '' : null));
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
      if (_disabled()) {
        return;
      }

      listboxState()?.selectOption(value(), origin);
    }

    function activate(): void {
      if (_disabled()) {
        return;
      }

      listboxState()?.activateOption(value());
    }

    const state = {
      id,
      value,
      optionDisabled,
      active,
      selected,
      disabled: _disabled(),
      _disabled,
      setActiveStyles,
      setInactiveStyles,
      getLabel,
      select,
      activate,
      destroy,
    } satisfies NgpListboxOptionState<T>;

    function destroy(): void {
      listboxState()?.removeOption(state);
    }

    onDestroy(() => {
      destroy();
    });

    effect(() => listboxState()?.addOption(state));

    onDomRemoval(elementRef.nativeElement, () => {
      listboxState()?.removeOption(state);
      setInactiveStyles();
    });

    return state;
  },
);
