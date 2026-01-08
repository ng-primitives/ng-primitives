import { afterRenderEffect, computed, Signal, signal, WritableSignal } from '@angular/core';
import type { Placement } from '@floating-ui/dom';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectConfig } from '../config/select-config';
import { NgpSelectDropdownState } from '../select-dropdown/select-dropdown-state';
import type { NgpSelectOptionState } from '../select-option/select-option-state';
import type { NgpSelectPortal } from '../select-portal/select-portal';

/**
 * Ideally we would use a generic type here, unfortunately, unlike in React,
 * we cannot infer the type based on another input. For example, if multiple
 * is true, we cannot infer that the value is an array of T. Using a union
 * type is not ideal either because it requires the user to handle multiple cases.
 * Using a generic also isn't ideal because we need to use T as both an array and
 * a single value.
 *
 * Any seems to be used by Angular Material, ng-select, and other libraries
 * so we will use it here as well.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

/** The state interface for the Select primitive. */
export interface NgpSelectState {
  /** The unique id of the select. */
  readonly id: Signal<string>;

  /** The value of the select. */
  readonly value: WritableSignal<T>;

  /** Whether the select is multiple selection. */
  readonly multiple: Signal<boolean>;

  /** Whether the select is disabled. */
  readonly disabled: Signal<boolean>;

  /** The comparator function used to compare options. */
  readonly compareWith: Signal<(a: T | undefined, b: T | undefined) => boolean>;

  /** The position of the dropdown. */
  readonly placement: Signal<Placement>;

  /** The container for the dropdown. */
  readonly container: Signal<HTMLElement | string | null>;

  /** @internal Store the select portal. */
  readonly portal: Signal<NgpSelectPortal | undefined>;

  /** @internal Store the select dropdown. */
  readonly dropdown: Signal<NgpSelectDropdownState | undefined>;

  /** @internal Store the select options. */
  readonly options: Signal<NgpSelectOptionState[]>;

  /** @internal Access the overlay. */
  readonly overlay: Signal<ReturnType<NonNullable<NgpSelectPortal['overlay']>> | undefined>;

  /** @internal The open state of the select. */
  readonly open: Signal<boolean>;

  /** @internal The active key descendant manager. */
  readonly activeDescendantManager: ReturnType<
    typeof activeDescendantManager<NgpSelectOptionState>
  >;

  /** @internal Access the select element. */
  readonly elementRef: ReturnType<typeof injectElementRef>;

  /** @internal Open the dropdown. */
  openDropdown(): Promise<void>;

  /** @internal Close the dropdown. */
  closeDropdown(): void;

  /** @internal Toggle the dropdown. */
  toggleDropdown(): Promise<void>;

  /**
   * Select an option.
   * @param option The option to select.
   * @internal
   */
  selectOption(option: NgpSelectOptionState | undefined): void;

  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpSelectOptionState): void;

  /**
   * Toggle the selection of an option.
   * @param option The option to toggle.
   * @internal
   */
  toggleOption(option: NgpSelectOptionState): void;

  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected(option: NgpSelectOptionState): boolean;

  /**
   * Activate the next option in the list if there is one.
   * If there is no option currently active, activate the selected option or the first option.
   * @internal
   */
  activateNextOption(): void;

  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void;

  /**
   * Register the dropdown portal with the select.
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpSelectPortal): void;

  /**
   * Register the dropdown with the select.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpSelectDropdownState): void;

  /**
   * Register an option with the select.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpSelectOptionState): void;

  /**
   * Unregister an option from the select.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpSelectOptionState): void;

  /**
   * Focus the select.
   * @internal
   */
  focus(): void;
}

/** The props interface for the Select primitive. */
export interface NgpSelectProps {
  /** The unique id of the select. */
  readonly id?: Signal<string>;

  /** The value of the select. */
  readonly value?: Signal<T>;

  /** Whether the select is multiple selection. */
  readonly multiple?: Signal<boolean>;

  /** Whether the select is disabled. */
  readonly disabled?: Signal<boolean>;

  /** The comparator function used to compare options. */
  readonly compareWith?: Signal<(a: T | undefined, b: T | undefined) => boolean>;

  /** The position of the dropdown. */
  readonly placement?: Signal<Placement>;

  /** The container for the dropdown. */
  readonly container?: Signal<HTMLElement | string | null>;

  /** Emit when the value changes. */
  readonly onValueChange?: (value: T) => void;

  /** Emit when the dropdown open state changes. */
  readonly onOpenChange?: (open: boolean) => void;
}

export const [NgpSelectStateToken, ngpSelect, _injectSelectState, provideSelectState] =
  createPrimitive(
    'NgpSelect',
    ({
      id: _id = signal(uniqueId('ngp-select')),
      value: _value = signal(undefined),
      multiple: _multiple = signal(false),
      disabled: _disabled = signal(false),
      compareWith: _compareWith = signal(Object.is),
      placement: _placement,
      container: _container,
      onValueChange,
      onOpenChange,
    }: NgpSelectProps): NgpSelectState => {
      /** Access the select configuration. */
      const config = injectSelectConfig();

      /** @internal Access the select element. */
      const elementRef = injectElementRef();

      // Create controlled signals
      const id = controlled(_id);
      const value = controlled(_value);
      const multiple = controlled(_multiple);
      const disabled = controlled(_disabled);
      const compareWith = controlled(_compareWith);
      const placement = controlled(_placement ? _placement : signal(config.placement));
      const container = controlled(_container ? _container : signal(config.container));

      /** @internal Store the select portal. */
      const portal = signal<NgpSelectPortal | undefined>(undefined);

      /** @internal Store the select dropdown. */
      const dropdown = signal<NgpSelectDropdownState | undefined>(undefined);

      /** @internal Store the select options. */
      const options = signal<NgpSelectOptionState[]>([]);

      /** @internal Access the overlay. */
      const overlay = computed(() => portal()?.overlay());

      /** @internal The open state of the select. */
      const open = computed(() => overlay()?.isOpen() ?? false);

      /** @internal The active key descendant manager. */
      const activeDescendantMgr = activeDescendantManager<NgpSelectOptionState>({
        // we must wrap the signal in a computed to ensure it is not used before it is defined
        disabled: computed(() => disabled()),
        items: options,
      });

      // Host bindings
      attrBinding(elementRef, 'role', 'combobox');
      attrBinding(elementRef, 'id', id);
      attrBinding(elementRef, 'aria-expanded', open);
      attrBinding(elementRef, 'aria-controls', () => (open() ? dropdown()?.id() : undefined));
      attrBinding(elementRef, 'aria-activedescendant', () =>
        open() ? activeDescendantMgr.activeDescendant() : undefined,
      );
      attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
      dataBinding(elementRef, 'data-open', open);
      dataBinding(elementRef, 'data-disabled', disabled);
      dataBinding(elementRef, 'data-multiple', multiple);

      // Event listeners
      listener(elementRef, 'click', toggleDropdown);
      listener(elementRef, 'keydown', handleKeydown);
      listener(elementRef, 'blur', onBlur);

      // Setup interactions
      ngpInteractions({
        focus: true,
        focusWithin: true,
        hover: true,
        press: true,
        disabled: disabled,
      });

      ngpFormControl({ id: id, disabled: disabled });

      // any time the active descendant changes, ensure we scroll it into view
      // perform after next render to ensure the DOM is updated
      // e.g. the dropdown is open before the option is scrolled into view
      afterRenderEffect({
        write: () => {
          const isPositioned = portal()?.overlay()?.isPositioned() ?? false;
          const activeItem = activeDescendantMgr.activeItem();

          if (!isPositioned || !activeItem) {
            return;
          }
          activeItem?.scrollIntoView?.();
        },
      });

      /** @internal Open the dropdown. */
      async function openDropdown(): Promise<void> {
        if (disabled() || open()) {
          return;
        }

        onOpenChange?.(true);
        await portal()?.show();

        // if there is a selected option(s), set the active descendant to the first selected option
        const selectedOption = options().find(option => isOptionSelected(option));

        // if there is no selected option, set the active descendant to the first option
        const targetOption = selectedOption ?? options()[0];

        // if there is no target option, do nothing
        if (!targetOption) {
          return;
        }

        // activate the selected option or the first option
        activeDescendantMgr.activate(targetOption);
      }

      /** @internal Close the dropdown. */
      function closeDropdown(): void {
        if (!open()) {
          return;
        }

        onOpenChange?.(false);
        portal()?.detach();

        // clear the active descendant
        activeDescendantMgr.reset();
      }

      /** @internal Toggle the dropdown. */
      async function toggleDropdown(): Promise<void> {
        if (open()) {
          closeDropdown();
        } else {
          await openDropdown();
        }
      }

      function selectOption(option: NgpSelectOptionState | undefined): void {
        if (disabled()) {
          return;
        }

        if (!option) {
          value.set(undefined);
          closeDropdown();
          return;
        }

        if (multiple()) {
          // if the option is already selected, do nothing
          if (isOptionSelected(option)) {
            return;
          }

          const newValue = [...((value() ?? []) as T[]), option.value() as T];

          // add the option to the value
          value.set(newValue as T);
          onValueChange?.(newValue as T);
        } else {
          value.set(option.value() as T);
          onValueChange?.(option.value() as T);

          // close the dropdown on single selection
          closeDropdown();
        }
      }

      function deselectOption(option: NgpSelectOptionState): void {
        // if the select is disabled or the option is not selected, do nothing
        // if the select is single selection, we don't allow deselecting
        if (disabled() || !isOptionSelected(option) || !multiple()) {
          return;
        }

        const values = (value() as T[]) ?? [];

        const newValue = values.filter(v => !compareWith()(v, option.value() as T));

        // remove the option from the value
        value.set(newValue as T);
        onValueChange?.(newValue as T);
      }

      function toggleOption(option: NgpSelectOptionState): void {
        if (disabled()) {
          return;
        }

        // if the state is single selection, we don't allow toggling
        if (!multiple()) {
          // always select the option in single selection mode even if it is already selected so that we update the input
          selectOption(option);
          return;
        }

        // otherwise toggle the option
        if (isOptionSelected(option)) {
          deselectOption(option);
        } else {
          selectOption(option);
        }
      }

      function isOptionSelected(option: NgpSelectOptionState): boolean {
        if (disabled()) {
          return false;
        }

        const currentValue = value();

        if (!currentValue) {
          return false;
        }

        if (multiple()) {
          return currentValue && (currentValue as T[]).some(v => compareWith()(option.value(), v));
        }

        return compareWith()(option.value(), currentValue);
      }

      function activateNextOption(): void {
        if (disabled()) {
          return;
        }

        const opts = options();

        // if there are no options, do nothing
        if (opts.length === 0) {
          return;
        }

        // if there is no active option, activate the first option
        if (!activeDescendantMgr.activeItem()) {
          const selectedOption = opts.find(option => isOptionSelected(option));

          // if there is a selected option(s), set the active descendant to the first selected option
          const targetOption = selectedOption ?? opts[0];

          activeDescendantMgr.activate(targetOption);
          return;
        }

        // otherwise activate the next option
        activeDescendantMgr.next();
      }

      function activatePreviousOption(): void {
        if (disabled()) {
          return;
        }
        const opts = options();
        // if there are no options, do nothing
        if (opts.length === 0) {
          return;
        }
        // if there is no active option, activate the last option
        if (!activeDescendantMgr.activeItem()) {
          const selectedOption = opts.find(option => isOptionSelected(option));
          // if there is a selected option(s), set the active descendant to the first selected option
          const targetOption = selectedOption ?? opts[opts.length - 1];
          activeDescendantMgr.activate(targetOption);
          return;
        }
        // otherwise activate the previous option
        activeDescendantMgr.previous();
      }

      function registerPortal(portalInstance: NgpSelectPortal): void {
        portal.set(portalInstance);
      }

      function registerDropdown(dropdownInstance: NgpSelectDropdownState): void {
        dropdown.set(dropdownInstance);
      }

      function registerOption(option: NgpSelectOptionState): void {
        options.update(opts => [...opts, option]);
      }

      function unregisterOption(option: NgpSelectOptionState): void {
        options.update(opts => opts.filter(o => o !== option));
      }

      function focus(): void {
        elementRef.nativeElement.focus();
      }

      function handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
          case 'ArrowDown':
            if (open()) {
              activateNextOption();
            } else {
              openDropdown();
            }
            event.preventDefault();
            break;
          case 'ArrowUp':
            if (open()) {
              activatePreviousOption();
            } else {
              openDropdown();
              activeDescendantMgr.last();
            }
            event.preventDefault();
            break;
          case 'Home':
            if (open()) {
              activeDescendantMgr.first();
            }
            event.preventDefault();
            break;
          case 'End':
            if (open()) {
              activeDescendantMgr.last();
            }
            event.preventDefault();
            break;
          case 'Enter':
            if (open()) {
              selectOption(activeDescendantMgr.activeItem());
            } else {
              openDropdown();
            }
            event.preventDefault();
            break;
          case ' ':
            toggleDropdown();
            event.preventDefault();
            break;
        }
      }

      function onBlur(event: FocusEvent): void {
        const relatedTarget = event.relatedTarget as HTMLElement;

        // if the blur was caused by focus moving to the dropdown, don't close
        if (relatedTarget && dropdown()?.elementRef.nativeElement.contains(relatedTarget)) {
          return;
        }

        closeDropdown();
        event.preventDefault();
      }

      return {
        id,
        value,
        multiple,
        disabled,
        compareWith,
        placement,
        container,
        portal,
        dropdown,
        options,
        overlay,
        open,
        activeDescendantManager: activeDescendantMgr,
        elementRef,
        openDropdown,
        closeDropdown,
        toggleDropdown,
        selectOption,
        deselectOption,
        toggleOption,
        isOptionSelected,
        activateNextOption,
        activatePreviousOption,
        registerPortal,
        registerDropdown,
        registerOption,
        unregisterOption,
        focus,
      };
    },
  );

/** Injects the Select state. */
export function injectSelectState(): Signal<NgpSelectState> {
  return _injectSelectState();
}
