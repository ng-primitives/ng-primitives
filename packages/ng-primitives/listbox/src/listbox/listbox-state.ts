import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, inject, Injector, Signal, signal, WritableSignal } from '@angular/core';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { NgpSelectionMode } from 'ng-primitives/common';
import { ngpFocusVisible } from 'ng-primitives/interactions';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import {
  attrBinding,
  controlled,
  createPrimitive,
  deprecatedSetter,
  emitter,
  listener,
  SetterOptions,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { NgpListboxOptionState } from '../listbox-option/listbox-option-state';

export interface NgpListboxState<T> {
  /**
   * The listbox selection.
   */
  readonly value: WritableSignal<T[]>;
  /**
   * The listbox disabled state.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * @internal
   * Whether the listbox is focused.
   */
  readonly isFocused: Signal<boolean>;
  /**
   * @internal
   * Manages the active descendant so options can reflect their active state.
   */
  readonly activeDescendantManager: ReturnType<typeof activeDescendantManager>;
  /**
   * Emits when the listbox selection changes.
   */
  readonly valueChange: Observable<T[]>;
  /**
   * @internal
   * Selects an option in the listbox.
   */
  selectOption: (value: T, origin: FocusOrigin) => void;
  /**
   * @internal
   * Determine if an option is selected using the compareWith function.
   */
  isSelected: (value: T) => boolean;
  /**
   * @internal
   * Activate an option in the listbox.
   */
  activateOption: (value: T) => void;
  /**
   * Registers an option with the listbox.
   * @internal
   */
  addOption: (option: NgpListboxOptionState<T>) => void;
  /**
   * Deregisters an option with the listbox.
   * @internal
   */
  removeOption: (option: NgpListboxOptionState<T>) => void;
  /**
   * Sets the listbox selection.
   */
  setValue: (value: T[], options?: SetterOptions) => void;
  setDisabled: (value: boolean) => void;
}

export interface NgpListboxProps<T> {
  /**
   * The id of the listbox.
   */
  readonly id?: Signal<string>;
  /**
   * The listbox selection mode.
   */
  readonly mode?: Signal<NgpSelectionMode>;
  /**
   * The listbox selection.
   */
  readonly value?: Signal<T[]>;
  /**
   * The listbox disabled state.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * The comparator function to use when comparing values.
   * If not provided, strict equality (===) is used.
   */
  readonly compareWith?: Signal<(a: T, b: T) => boolean>;
  /**
   * Emits when the listbox selection changes.
   */
  readonly onValueChange?: (value: T[]) => void;
}

export const [NgpListboxStateToken, ngpListbox, _injectListboxState, provideListboxState] =
  createPrimitive(
    'NgpListbox',
    <T>({
      id = signal(uniqueId('ngp-listbox')),
      mode = signal<NgpSelectionMode>('single'),
      value: _value = signal<T[]>([]),
      disabled: _disabled = signal<boolean>(false),
      compareWith = signal<(a: T, b: T) => boolean>((a, b) => a === b),
      onValueChange,
    }: NgpListboxProps<T>) => {
      const elementRef = injectElementRef();
      const injector = inject(Injector);
      const popoverTriggerState = injectPopoverTriggerState({ optional: true });

      const options = signal<NgpListboxOptionState<T>[]>([]);
      const isFocused = signal<boolean>(false);

      const value = controlled(_value);
      const valueChange = emitter<T[]>();

      const disabled = controlled(_disabled);
      const tabIndex = computed(() => (disabled() ? -1 : 0));

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      const activeDescendant = activeDescendantManager({
        disabled,
        count: computed(() => options().length),
        getItemId: index => options()[index]?.id(),
        isItemDisabled: index => options()[index]?.disabled() ?? false,
        getItemLabel: index => options()[index]?.getLabel() ?? '',
        scrollIntoView: index => options()[index]?.scrollIntoView(),
      });

      // Setup interactions
      ngpFocusVisible({ disabled: disabled });

      // Host binding
      attrBinding(elementRef, 'role', 'listbox');
      attrBinding(elementRef, 'id', id);
      attrBinding(elementRef, 'tabindex', tabIndex);
      attrBinding(elementRef, 'aria-disabled', disabled);
      attrBinding(elementRef, 'aria-multiselectable', () => mode() === 'multiple');
      attrBinding(elementRef, 'aria-activedescendant', activeDescendant.id);

      // Listener
      listener(elementRef, 'focusin', () => isFocused.set(true));
      listener(elementRef, 'focusout', () => isFocused.set(false));
      listener(elementRef, 'keydown', onKeydown);

      // Start with nothing active so the initial sync picks the selected option (or
      // the first option) rather than defaulting to the first index.
      activeDescendant.reset();

      // Keep the active item in sync as options register/change and as the value
      // changes (e.g. the previously active item was removed). This runs on setup
      // too, so it sets the initial active item once the options are projected.
      explicitEffect([options, value], () => updateActiveItem(), { injector });

      function updateActiveItem(): void {
        const items = options();
        const index = activeDescendant.index();

        // keep the current active option if it is still present and enabled
        if (index >= 0 && index < items.length && !items[index].disabled()) {
          return;
        }

        // otherwise activate the selected option, falling back to the first enabled option
        const selectedIndex = items.findIndex(o => o.selected());

        if (selectedIndex >= 0 && !items[selectedIndex].disabled()) {
          activeDescendant.activateByIndex(selectedIndex, { scroll: false });
        } else {
          activeDescendant.first({ scroll: false });
        }
      }

      function onKeydown(event: KeyboardEvent): void {
        switch (event.key) {
          case 'ArrowDown':
            activeDescendant.next({ origin: 'keyboard' });
            event.preventDefault();
            break;
          case 'ArrowUp':
            activeDescendant.previous({ origin: 'keyboard' });
            event.preventDefault();
            break;
          case 'Home':
            activeDescendant.first({ origin: 'keyboard' });
            event.preventDefault();
            break;
          case 'End':
            activeDescendant.last({ origin: 'keyboard' });
            event.preventDefault();
            break;
          case 'Enter':
          case ' ': {
            // select the active option if there is one
            const activeId = activeDescendant.id();
            if (activeId) {
              options()
                .find(o => o.id() === activeId)
                ?.select('keyboard');
            }
            event.preventDefault();
            break;
          }
          default:
            // a single printable character starts/continues a typeahead search
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
              activeDescendant.typeahead(event.key);
            }
        }
      }

      function setValue(newValue: T[], options?: SetterOptions): void {
        value.set(newValue);

        if (options?.emit !== false) {
          valueChange.emit(newValue);
          onValueChange?.(newValue);
        }
      }

      function selectOption(val: T, origin: FocusOrigin): void {
        if (mode() === 'single') {
          setValue([val]);
        } else if (isSelected(val)) {
          // if the value is already selected, remove it, otherwise add it
          setValue(value().filter(v => !compareWith()(v, val)));
        } else {
          setValue([...value(), val]);
        }

        // Set the active descendant to the selected option.
        const index = options().findIndex(o => compareWith()(o.value(), val));

        if (index >= 0) {
          activeDescendant.activateByIndex(index);
        }

        // If the listbox is within a popover, close the popover on selection if it is not in a multiple selection mode.
        if (mode() !== 'multiple') {
          popoverTriggerState()?.hide(origin);
        }
      }

      function activateOption(val: T) {
        const index = options().findIndex(o => compareWith()(o.value(), val));

        if (index >= 0) {
          activeDescendant.activateByIndex(index, { origin: 'pointer' });
        }
      }

      function addOption(option: NgpListboxOptionState<T>): void {
        // if the option already exists, do not add it again
        if (!options().includes(option)) {
          options.update(options => [...options, option]);
        }
      }

      function removeOption(option: NgpListboxOptionState<T>): void {
        options.update(options => options.filter(o => o !== option));
      }

      function isSelected(val: T): boolean {
        // a form may write null/undefined (writeValue(null) / reset); treat as empty
        return (value() ?? []).some(v => compareWith()(v, val));
      }

      return {
        value: deprecatedSetter(value, 'setValue', setValue),
        disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
        isFocused,
        activeDescendantManager: activeDescendant,
        valueChange: valueChange.asObservable(),
        selectOption,
        isSelected,
        activateOption,
        addOption,
        removeOption,
        setValue,
        setDisabled,
      } satisfies NgpListboxState<T>;
    },
  );

export function injectListboxState<T>(options?: StateInjectionOptions): Signal<NgpListboxState<T>> {
  return _injectListboxState(options) as Signal<NgpListboxState<T>>;
}
