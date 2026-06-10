import { ActiveDescendantKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import {
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { NgpSelectionMode } from 'ng-primitives/common';
import { ngpFocusVisible } from 'ng-primitives/interactions';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import {
  attrBinding,
  controlledState,
  createPrimitive,
  deprecatedSetter,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { Observable } from 'rxjs';
import { NgpListboxOptionState } from '../listbox-option/listbox-option-state';

export interface NgpListboxState<T> {
  /** Access the component's reference. */
  readonly elementRef: ElementRef;
  /**
   * The id of the listbox.
   */
  readonly id?: Signal<string>;
  /**
   * The listbox selection mode.
   */
  readonly mode: Signal<NgpSelectionMode>;
  /**
   * The listbox selection.
   */
  readonly value: WritableSignal<T[]>;
  /**
   * The listbox disabled state.
   */
  readonly disabled: Signal<boolean>;
  /**
   * The comparator function to use when comparing values.
   * If not provided, strict equality (===) is used.
   */
  readonly compareWith: Signal<(a: T, b: T) => boolean>;
  /**
   * @internal
   * Whether the listbox is focused.
   */
  readonly isFocused: Signal<boolean>;
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
  onAfterContentInit: () => void;
  setValue: (value: T[]) => void;
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
      id = signal<string>(''),
      mode = signal<NgpSelectionMode>('single'),
      value: _value = signal<T[]>([]),
      disabled = signal<boolean>(false),
      compareWith = signal<(a: T, b: T) => boolean>((a, b) => a === b),
      onValueChange,
    }: NgpListboxProps<T>) => {
      const elementRef = injectElementRef();
      const injector = inject(Injector);
      const destroyRef = inject(DestroyRef);
      const popoverTriggerState = injectPopoverTriggerState({ optional: true });

      const options = signal<NgpListboxOptionState<T>[]>([]);
      const activeDescendant = signal<string | undefined>(undefined);
      const isFocused = signal<boolean>(false);
      const tabIndex = computed(() => (disabled() ? -1 : 0));

      const [value, setValue, valueChange] = controlledState({
        value: _value,
        defaultValue: signal<T[]>([]),
        onChange: onValueChange,
      });

      // Setup interactions
      ngpFocusVisible({ disabled: disabled });

      // Host binding
      attrBinding(elementRef, 'role', 'listbox');
      attrBinding(elementRef, 'id', () => id());
      attrBinding(elementRef, 'tabindex', () => tabIndex());
      attrBinding(elementRef, 'aria-disabled', () => disabled());
      attrBinding(elementRef, 'aria-multiselectable', () => mode() === 'multiple');
      attrBinding(elementRef, 'aria-activedescendant', () => activeDescendant());

      // Listener
      listener(elementRef, 'focusin', () => isFocused.set(true));
      listener(elementRef, 'focusout', () => isFocused.set(false));
      listener(elementRef, 'keydown', onKeydown);

      const keyManager = new ActiveDescendantKeyManager(options, injector);

      function onAfterContentInit(): void {
        keyManager.withHomeAndEnd().withTypeAhead().withVerticalOrientation();

        keyManager.change
          .pipe(safeTakeUntilDestroyed(destroyRef))
          .subscribe(() => activeDescendant.set(keyManager.activeItem?.id?.()));

        // On initialization, set the first selected option as the active descendant if there is one.
        updateActiveItem();

        // if the options change, update the active item, for example the item that was previously active may have been removed
        // any time the value changes we should make sure that the active item is updated
        explicitEffect([options], () => updateActiveItem(), {
          injector: injector,
        });
      }

      function updateActiveItem(): void {
        const activeItem = keyManager.activeItem;
        if (activeItem && options().includes(activeItem)) {
          return;
        }

        const selectedOption = options().find(o => o.selected());

        if (selectedOption) {
          keyManager.setActiveItem(selectedOption);
        } else {
          keyManager.setFirstItemActive();
        }
      }

      function onKeydown(event: KeyboardEvent): void {
        keyManager.onKeydown(event);

        // if the keydown was enter or space, select the active descendant if there is one
        if (event.key === 'Enter' || event.key === ' ') {
          keyManager.activeItem?.select('keyboard');
        }

        // if this is an arrow key or selection key, prevent the default action to prevent the page from scrolling
        if (
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp' ||
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
        }
      }

      function selectOption(val: T, origin: FocusOrigin): void {
        if (mode() === 'single') {
          const newValue = [val];
          setValue(newValue);
        } else {
          // if the value is already selected, remove it, otherwise add it
          if (isSelected(val)) {
            const newValue = value().filter(v => !compareWith()(v, val));
            setValue(newValue);
          } else {
            const newValue = [...value(), val];
            setValue(newValue);
          }
        }

        // Set the active descendant to the selected option.
        const option = options().find(o => compareWith()(o.value(), val));

        if (option) {
          keyManager.setActiveItem(option);
        }

        // If the listbox is within a popover, close the popover on selection if it is not in a multiple selection mode.
        if (mode() !== 'multiple') {
          popoverTriggerState()?.hide(origin);
        }
      }

      function activateOption(value: T) {
        const option = options().find(o => compareWith()(o.value(), value));

        if (option) {
          keyManager.setActiveItem(option);
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
        return value().some(v => compareWith()(v, val));
      }

      return {
        elementRef,
        id,
        mode,
        value: deprecatedSetter(value, 'setValue', setValue),
        disabled,
        compareWith,
        isFocused,
        valueChange,
        selectOption,
        isSelected,
        activateOption,
        addOption,
        removeOption,
        onAfterContentInit,
        setValue,
      } satisfies NgpListboxState<T>;
    },
  );

export function injectListboxState<T>(options?: StateInjectionOptions): Signal<NgpListboxState<T>> {
  return _injectListboxState(options) as Signal<NgpListboxState<T>>;
}
