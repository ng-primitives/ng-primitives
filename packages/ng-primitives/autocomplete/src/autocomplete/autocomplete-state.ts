import {
  afterNextRender,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import type {
  NgpFlip,
  NgpOffset,
  NgpOverlay,
  NgpPlacement,
  NgpPosition,
} from 'ng-primitives/portal';
import { createPrimitive, dataBinding, listener, StateInjectionOptions } from 'ng-primitives/state';
import type { NgpAutocompleteButtonState } from '../autocomplete-button/autocomplete-button-state';
import type { NgpAutocompleteDropdownState } from '../autocomplete-dropdown/autocomplete-dropdown-state';
import type { NgpAutocompleteInputState } from '../autocomplete-input/autocomplete-input-state';
import type { NgpAutocompleteOptionState } from '../autocomplete-option/autocomplete-option-state';
import type { NgpAutocompletePortalState } from '../autocomplete-portal/autocomplete-portal-state';

export interface NgpAutocompleteOpenOptions {
  /**
   * Which option to activate once the dropdown has opened. The option matching the selected
   * value wins when there is one. Otherwise `'first'` and `'last'` activate that end of the list
   * and `'selected'` leaves none active. When omitted, no option is active, so Enter keeps the
   * typed text.
   */
  readonly activate?: 'selected' | 'first' | 'last';
}

export interface NgpAutocompleteState<T> {
  /**
   * @internal Access the autocomplete element.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** Whether the autocomplete is disabled. */
  readonly disabled: Signal<boolean>;

  /** The position of the dropdown. */
  readonly placement: Signal<NgpPlacement>;

  /** The container for the dropdown. */
  readonly container: Signal<HTMLElement | string | null>;

  /** Whether the dropdown should flip when there is not enough space. */
  readonly flip: Signal<NgpFlip>;

  /** The offset of the dropdown relative to the trigger. */
  readonly offset: Signal<NgpOffset>;

  /**
   * The autocomplete input.
   * @internal
   */
  readonly input: Signal<NgpAutocompleteInputState | undefined>;

  /**
   * The autocomplete button.
   * @internal
   */
  readonly button: Signal<NgpAutocompleteButtonState | undefined>;

  /**
   * The autocomplete dropdown.
   * @internal
   */
  readonly dropdown: Signal<NgpAutocompleteDropdownState | undefined>;

  /**
   * The overlay that renders the dropdown.
   * @internal
   */
  readonly overlay: Signal<NgpOverlay<void> | null | undefined>;

  /** Whether the dropdown is open. */
  readonly open: Signal<boolean>;

  /** The id of the dropdown, for `aria-controls`. */
  readonly dropdownId: Signal<string | undefined>;

  /** The id of the active option, for `aria-activedescendant`. */
  readonly activeOptionId: Signal<string | undefined>;

  /**
   * The option the active descendant points at.
   * @internal
   */
  readonly activeOption: Signal<NgpAutocompleteOptionState | undefined>;

  /** The viewport position the dropdown is placed at instead of the autocomplete element. */
  readonly position: Signal<NgpPosition | null>;

  /**
   * The active descendant manager.
   * @internal
   */
  readonly activeDescendantManager: ReturnType<typeof activeDescendantManager>;

  /** Open the dropdown. Without an `activate` option, no option is active. */
  openDropdown(options?: NgpAutocompleteOpenOptions): Promise<void>;

  /** Close the dropdown. */
  closeDropdown(): void;

  /** Toggle the dropdown. */
  toggleDropdown(options?: NgpAutocompleteOpenOptions): Promise<void>;

  /**
   * Search by a new query, as typing does: the dropdown opens from the minimum length and closes
   * below it or with `null`. `ngpAutocompleteInput` calls it for you.
   */
  setQuery(query: string | null): void;

  /**
   * Open or close the dropdown for a new query, `null` when there is nothing to search.
   * Only typing opens it and moves the active option.
   * @internal
   */
  onQueryChange(query: string | null, options: { typed: boolean }): void;

  /** Place the dropdown at a viewport position, or at the autocomplete element with `null`. */
  setPosition(position: NgpPosition | null): void;

  /**
   * Handle the overlay being closed, however it was closed.
   * @internal
   */
  onOverlayClose(): void;

  /**
   * Emit the option's value as a selection and close the dropdown.
   * @internal
   */
  selectOption(option: NgpAutocompleteOptionState): void;

  /** Select the active option, as Enter does. Returns whether an option was active. */
  selectActiveOption(): boolean;

  /**
   * Whether a value matches the selected value.
   * @internal
   */
  isOptionSelected(value: T | undefined): boolean;

  /** Activate the next option, or the selected option when none is active. */
  activateNextOption(): void;

  /** Activate the previous option, or the selected option when none is active. */
  activatePreviousOption(): void;

  /** @internal */
  registerPortal(portal: NgpAutocompletePortalState): void;

  /** @internal */
  unregisterPortal(portal: NgpAutocompletePortalState): void;

  /** @internal */
  registerDropdown(dropdown: NgpAutocompleteDropdownState): void;

  /** @internal */
  unregisterDropdown(dropdown: NgpAutocompleteDropdownState): void;

  /** @internal */
  registerInput(input: NgpAutocompleteInputState): void;

  /** @internal */
  unregisterInput(input: NgpAutocompleteInputState): void;

  /** @internal */
  registerButton(button: NgpAutocompleteButtonState): void;

  /** @internal */
  unregisterButton(button: NgpAutocompleteButtonState): void;

  /** @internal */
  registerOption(option: NgpAutocompleteOptionState): void;

  /** @internal */
  unregisterOption(option: NgpAutocompleteOptionState): void;
}

export interface NgpAutocompleteProps<T> {
  /** The value of the chosen option. The autocomplete reads it but never writes it. */
  readonly selectedValue?: Signal<T | undefined>;

  /** The comparator used to match an option's value against the selected value. */
  readonly compareWith?: Signal<(a: T | undefined, b: T | undefined) => boolean>;

  /** Whether the autocomplete is disabled. */
  readonly disabled?: Signal<boolean>;

  /** The position of the dropdown. */
  readonly placement?: Signal<NgpPlacement>;

  /** The container for the dropdown. */
  readonly container?: Signal<HTMLElement | string | null>;

  /** Whether the dropdown should flip when there is not enough space. */
  readonly flip?: Signal<NgpFlip>;

  /** The offset of the dropdown relative to the trigger. */
  readonly offset?: Signal<NgpOffset>;

  /** Scroll an option into view, for virtual scrolling where it may not be rendered. */
  readonly scrollToOption?: Signal<((index: number) => void) | undefined>;

  /** Every option value, in display order, for virtual scrolling. */
  readonly allOptions?: Signal<T[] | undefined>;

  /** Whether typing activates the first option, so Enter picks it. */
  readonly autoActivate?: Signal<boolean>;

  /** The query length from which typing opens the dropdown. */
  readonly minLength?: Signal<number>;

  /** Called with the value of an option the user selects. */
  readonly onSelected?: (value: T) => void;

  /** Called with the value of the active option, `undefined` when none is active. */
  readonly onActiveValueChange?: (value: T | undefined) => void;

  /** Called when the dropdown opens or closes. */
  readonly onOpenChange?: (open: boolean) => void;
}

export const [
  NgpAutocompleteStateToken,
  ngpAutocomplete,
  _injectAutocompleteState,
  provideAutocompleteState,
] = createPrimitive(
  'NgpAutocomplete',
  <T>({
    selectedValue = signal<T | undefined>(undefined),
    compareWith = signal<(a: T | undefined, b: T | undefined) => boolean>(Object.is),
    disabled = signal(false),
    placement = signal<NgpPlacement>('bottom'),
    container = signal<HTMLElement | string | null>('body'),
    flip = signal<NgpFlip>(true),
    offset = signal<NgpOffset>(0),
    scrollToOption = signal<((index: number) => void) | undefined>(undefined),
    allOptions = signal<T[] | undefined>(undefined),
    autoActivate = signal(false),
    minLength = signal(1),
    onSelected,
    onActiveValueChange,
    onOpenChange,
  }: NgpAutocompleteProps<T>): NgpAutocompleteState<T> => {
    const elementRef = injectElementRef<HTMLElement>();
    const injector = inject(Injector);

    const portal = signal<NgpAutocompletePortalState | undefined>(undefined);
    const dropdown = signal<NgpAutocompleteDropdownState | undefined>(undefined);
    const input = signal<NgpAutocompleteInputState | undefined>(undefined);
    const button = signal<NgpAutocompleteButtonState | undefined>(undefined);
    const options = signal<NgpAutocompleteOptionState[]>([]);
    const position = signal<NgpPosition | null>(null);

    const overlay = computed(() => portal()?.overlay());

    // The overlay keeps reporting itself open until its exit animation ends.
    const closing = signal(false);

    // A dropdown that is closing counts as closed, so input that arrives during its exit
    // animation opens it again.
    const open = computed(() => !closing() && (overlay()?.isOpen() ?? false));

    const sortedOptions = computed(() =>
      domSort(
        options(),
        option => option.elementRef.nativeElement,
        option => option.index(),
      ),
    );

    const activeDescendantManagerInstance = activeDescendantManager({
      disabled,
      wrap: signal(true),
      count: computed(() => allOptions()?.length ?? options().length),
      getItemId: index => getOptionAtIndex(index)?.id(),
      isItemDisabled: index => getOptionAtIndex(index)?.disabled() ?? false,
      scrollIntoView: index => {
        const isPositioned = overlay()?.isPositioned() ?? false;

        if (!isPositioned || index === -1) {
          return;
        }

        scrollTo(index);
      },
    });

    const dropdownId = computed(() => dropdown()?.id());

    const activeOption = computed(() => {
      const activeId = activeDescendantManagerInstance.id();
      return activeId ? sortedOptions().find(option => option.id() === activeId) : undefined;
    });

    // with virtual scrolling the active option may not be rendered, so allOptions comes first
    const activeValue = computed(() => {
      const virtualOptions = allOptions();

      if (virtualOptions) {
        return virtualOptions[activeDescendantManagerInstance.index()];
      }

      return activeOption()?.value();
    });

    // When the visible (or virtual) options change while open, revalidate so the active index
    // can't point at a removed option. Unless typing activates the first option, no active option
    // is a valid state, as it lets Enter keep the typed text, and validate() would replace it.
    effect(() => {
      sortedOptions();
      allOptions();

      const hasActiveOption = untracked(() => activeDescendantManagerInstance.index()) !== -1;

      if (open() && (autoActivate() || hasActiveOption)) {
        untracked(() => activeDescendantManagerInstance.validate());
      }
    });

    let previousActiveValue: T | undefined;

    effect(() => {
      const value = activeValue();

      if (value !== previousActiveValue) {
        previousActiveValue = value;
        untracked(() => onActiveValueChange?.(value));
      }
    });

    // The exit animation has ended once the overlay stops reporting itself open, so the
    // next open starts from a fully closed dropdown.
    effect(() => {
      if (!overlay()?.isOpen()) {
        untracked(() => closing.set(false));
      }
    });

    ngpInteractions({
      focus: true,
      focusWithin: true,
      hover: true,
      press: true,
      disabled,
    });

    // The input can walk up to an ancestor NgControl, so its status is mirrored here.
    const controlStatus = computed(() => input()?.controlStatus());

    // Host bindings
    dataBinding(elementRef, 'data-open', open);
    dataBinding(elementRef, 'data-disabled', disabled);
    dataBinding(elementRef, 'data-invalid', () => controlStatus()?.invalid ?? null);
    dataBinding(elementRef, 'data-valid', () => controlStatus()?.valid ?? null);
    dataBinding(elementRef, 'data-touched', () => controlStatus()?.touched ?? null);
    dataBinding(elementRef, 'data-pristine', () => controlStatus()?.pristine ?? null);
    dataBinding(elementRef, 'data-dirty', () => controlStatus()?.dirty ?? null);
    dataBinding(elementRef, 'data-pending', () => controlStatus()?.pending ?? null);

    // Event listeners
    // whichever element inside drives the list, focus leaving the autocomplete closes it
    listener(elementRef, 'focusout', (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;

      if (
        next &&
        (elementRef.nativeElement.contains(next) ||
          dropdown()?.elementRef.nativeElement.contains(next))
      ) {
        return;
      }

      closeDropdown();
    });

    async function openDropdown(openOptions?: NgpAutocompleteOpenOptions): Promise<void> {
      if (disabled() || open()) {
        return;
      }

      // A closing dropdown is brought back by show(), which cancels its exit animation.
      const wasClosing = closing();
      closing.set(false);

      // Reopened from an openChange(false) handler, the overlay has not started its exit yet,
      // so show() would find it open and do nothing. The exit starts once that notification
      // returns, so show it again after that.
      if (wasClosing) {
        await Promise.resolve();
      }

      // the manager starts on the first option, but an autocomplete opens with none active
      activeDescendantManagerInstance.reset();

      onOpenChange?.(true);
      await portal()?.show();

      // options only register once the portal has rendered, so activation happens here
      if (!open() || !openOptions?.activate) {
        return;
      }

      const selectedIndex = findSelectedIndex();

      if (selectedIndex !== -1) {
        scrollTo(selectedIndex);
        activeDescendantManagerInstance.activateByIndex(selectedIndex, { scroll: false });
        return;
      }

      if (openOptions.activate === 'first') {
        activeDescendantManagerInstance.first();
      } else if (openOptions.activate === 'last') {
        activeDescendantManagerInstance.last({ scroll: false });
        deferScrollTo(activeDescendantManagerInstance.index());
      }
    }

    function closeDropdown(): void {
      if (!open()) {
        return;
      }

      portal()?.hide();
    }

    async function toggleDropdown(openOptions?: NgpAutocompleteOpenOptions): Promise<void> {
      if (open()) {
        closeDropdown();
      } else {
        await openDropdown(openOptions);
      }
    }

    let lastQuery: string | null = null;

    function setQuery(query: string | null): void {
      // an editor can report the same query again when only its caret moves, which must not
      // reset the active option
      if (open() && query === lastQuery) {
        return;
      }

      onQueryChange(query, { typed: true });
    }

    function onQueryChange(query: string | null, { typed }: { typed: boolean }): void {
      lastQuery = query;

      if (query === null || query.length < minLength()) {
        closeDropdown();
        return;
      }

      // a value written by code leaves the dropdown and the active option alone
      if (!typed) {
        return;
      }

      // typing hands visual focus back to the input, unless the first option should follow it
      if (open()) {
        moveActiveOptionForTyping();
        return;
      }

      void openDropdown().then(() => {
        if (open()) {
          moveActiveOptionForTyping();
        }
      });
    }

    function moveActiveOptionForTyping(): void {
      if (autoActivate()) {
        activeDescendantManagerInstance.first();
      } else {
        activeDescendantManagerInstance.reset();
      }
    }

    function setPosition(newPosition: NgpPosition | null): void {
      position.set(newPosition);
    }

    // Wired to the overlay's onClose, so outside clicks and Escape also emit openChange(false).
    function onOverlayClose(): void {
      closing.set(true);
      onOpenChange?.(false);
      activeDescendantManagerInstance.reset();
    }

    function selectOption(option: NgpAutocompleteOptionState): void {
      const value = option.value();

      // an option without a value only emits its own activated event
      if (disabled() || value === undefined) {
        return;
      }

      // the typed text comes back first, so the consumer writes the option over it
      input()?.clearCompletion();
      onSelected?.(value);
      closeDropdown();
    }

    function selectActiveOption(): boolean {
      const option = open() ? activeOption() : undefined;

      if (!option) {
        return false;
      }

      option.select();
      return true;
    }

    function isOptionSelected(value: T | undefined): boolean {
      const selected = selectedValue();

      if (disabled() || value === undefined || selected === undefined) {
        return false;
      }

      return compareWith()(value, selected);
    }

    function activateNextOption(): void {
      if (disabled() || sortedOptions().length === 0) {
        return;
      }

      if (activeDescendantManagerInstance.index() !== -1) {
        activeDescendantManagerInstance.next({ origin: 'keyboard' });
        return;
      }

      const selectedIndex = findSelectedIndex();

      if (selectedIndex !== -1) {
        activeDescendantManagerInstance.activateByIndex(selectedIndex, { origin: 'keyboard' });
      } else {
        activeDescendantManagerInstance.first({ origin: 'keyboard' });
      }
    }

    function activatePreviousOption(): void {
      if (disabled() || sortedOptions().length === 0) {
        return;
      }

      if (activeDescendantManagerInstance.index() !== -1) {
        activeDescendantManagerInstance.previous({ origin: 'keyboard' });
        return;
      }

      const selectedIndex = findSelectedIndex();

      if (selectedIndex !== -1) {
        activeDescendantManagerInstance.activateByIndex(selectedIndex, { origin: 'keyboard' });
      } else {
        activeDescendantManagerInstance.last({ origin: 'keyboard' });
      }
    }

    function findSelectedIndex(): number {
      // with virtual scrolling the selected option may not be rendered, so allOptions comes first
      const virtualIndex = allOptions()?.findIndex(option => isOptionSelected(option)) ?? -1;

      if (virtualIndex !== -1) {
        return virtualIndex;
      }

      return sortedOptions().findIndex(option => isOptionSelected(option.value()));
    }

    function registerPortal(portalInstance: NgpAutocompletePortalState): void {
      portal.set(portalInstance);
    }

    function unregisterPortal(portalInstance: NgpAutocompletePortalState): void {
      if (portal() === portalInstance) {
        portal.set(undefined);
      }
    }

    function registerDropdown(dropdownInstance: NgpAutocompleteDropdownState): void {
      dropdown.set(dropdownInstance);
    }

    function unregisterDropdown(dropdownInstance: NgpAutocompleteDropdownState): void {
      if (dropdown() === dropdownInstance) {
        dropdown.set(undefined);
      }
    }

    function registerInput(inputInstance: NgpAutocompleteInputState): void {
      input.set(inputInstance);
    }

    function unregisterInput(inputInstance: NgpAutocompleteInputState): void {
      if (input() === inputInstance) {
        input.set(undefined);
      }
    }

    function registerButton(buttonInstance: NgpAutocompleteButtonState): void {
      button.set(buttonInstance);
    }

    function unregisterButton(buttonInstance: NgpAutocompleteButtonState): void {
      if (button() === buttonInstance) {
        button.set(undefined);
      }
    }

    function registerOption(option: NgpAutocompleteOptionState): void {
      options.update(current => [...current, option]);
    }

    function unregisterOption(option: NgpAutocompleteOptionState): void {
      options.update(current => current.filter(o => o !== option));
    }

    function scrollTo(index: number): void {
      const customScrollToOption = scrollToOption();

      if (customScrollToOption) {
        customScrollToOption(index);
        return;
      }

      getOptionAtIndex(index)?.scrollIntoView();
    }

    function deferScrollTo(index: number): void {
      if (index === -1) {
        return;
      }

      afterNextRender(
        {
          write: () => {
            if (open()) {
              scrollTo(index);
            }
          },
        },
        { injector },
      );
    }

    function getOptionAtIndex(index: number): NgpAutocompleteOptionState | undefined {
      // an option with an explicit index wins, as virtual scrolling renders only part of the list
      return options().find(option => option.index() === index) ?? sortedOptions()[index];
    }

    return {
      elementRef,
      disabled,
      placement,
      container,
      flip,
      offset,
      input: input.asReadonly(),
      button: button.asReadonly(),
      dropdown: dropdown.asReadonly(),
      overlay,
      open,
      dropdownId,
      activeOptionId: activeDescendantManagerInstance.id,
      activeOption,
      position: position.asReadonly(),
      activeDescendantManager: activeDescendantManagerInstance,
      openDropdown,
      closeDropdown,
      toggleDropdown,
      setQuery,
      onQueryChange,
      setPosition,
      onOverlayClose,
      selectOption,
      selectActiveOption,
      isOptionSelected,
      activateNextOption,
      activatePreviousOption,
      registerPortal,
      unregisterPortal,
      registerDropdown,
      unregisterDropdown,
      registerInput,
      unregisterInput,
      registerButton,
      unregisterButton,
      registerOption,
      unregisterOption,
    } satisfies NgpAutocompleteState<T>;
  },
);

export function injectAutocompleteState<T>(
  options?: StateInjectionOptions,
): Signal<NgpAutocompleteState<T>> {
  return _injectAutocompleteState(options) as Signal<NgpAutocompleteState<T>>;
}
