import { afterNextRender, ElementRef, inject, Injector, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

export interface NgpSelectInputState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLInputElement>;

  /** The id of the input. */
  readonly id: Signal<string>;

  /**
   * Focus the input field.
   * @internal
   */
  focus(): void;
}

export interface NgpSelectInputProps {
  /** The id of the input. */
  readonly id?: Signal<string>;
}

export const [
  NgpSelectInputStateToken,
  ngpSelectInput,
  _injectSelectInputState,
  provideSelectInputState,
] = createPrimitive(
  'NgpSelectInput',
  ({ id = signal(uniqueId('ngp-select-input')) }: NgpSelectInputProps) => {
    const elementRef = injectElementRef<HTMLInputElement>();
    const selectState = injectSelectState();
    const injector = inject(Injector);

    ngpInteractions({
      focus: true,
      hover: true,
      press: true,
      disabled: selectState().disabled,
    });

    // Static host bindings
    attrBinding(elementRef, 'role', 'combobox');
    attrBinding(elementRef, 'type', 'text');
    attrBinding(elementRef, 'autocomplete', 'off');
    attrBinding(elementRef, 'autocorrect', 'off');
    attrBinding(elementRef, 'spellcheck', 'false');
    attrBinding(elementRef, 'aria-autocomplete', 'list');
    attrBinding(elementRef, 'id', id);

    // Dynamic host bindings
    attrBinding(elementRef, 'aria-expanded', () => selectState().open());
    attrBinding(elementRef, 'aria-controls', () => {
      if (!selectState().open()) {
        return undefined;
      }
      return selectState().list()?.id() ?? selectState().dropdown()?.id();
    });
    attrBinding(elementRef, 'aria-activedescendant', () =>
      selectState().open() ? selectState().activeDescendantManager.id() : undefined,
    );
    attrBinding(elementRef, 'disabled', () => (selectState().disabled() ? '' : null));
    dataBinding(elementRef, 'data-open', () => (selectState().open() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (selectState().disabled() ? '' : null));
    dataBinding(elementRef, 'data-multiple', () => (selectState().multiple() ? '' : null));

    // Event listeners
    listener(elementRef, 'keydown', handleKeydown);
    listener(elementRef, 'blur', onBlur);

    /**
     * Handle keydown events for accessibility.
     *
     * The input lives inside the dropdown, so it only exists while the dropdown is open and
     * only ever receives a key while it is. Nothing here needs to open the dropdown, and any
     * closed-state branch would be unreachable: the overlay reports itself open for the whole
     * exit animation and the view is gone by the time it reports otherwise.
     */
    function handleKeydown(event: KeyboardEvent): void {
      switch (event.key) {
        case 'ArrowDown':
          selectState().activateNextOption();
          event.preventDefault();
          break;
        case 'ArrowUp':
          selectState().activatePreviousOption();
          event.preventDefault();
          break;
        case 'Home':
          // let the caret move within the search term
          break;
        case 'End':
          // let the caret move within the search term
          break;
        case 'Enter': {
          const activeId = selectState().activeDescendantManager.id();

          if (activeId) {
            const option = selectState()
              .sortedOptions()
              .find(opt => opt.id() === activeId);
            option?.select();
          }

          if (!selectState().multiple()) {
            selectState().focus();
          }

          event.preventDefault();
          break;
        }
        case 'Escape':
          selectState().closeDropdown();
          selectState().focus();
          event.preventDefault();
          break;
      }
    }

    function onBlur(event: FocusEvent): void {
      const relatedTarget = event.relatedTarget as HTMLElement;

      // if the blur was caused by focus moving into the dropdown, don't close
      if (
        relatedTarget &&
        selectState().dropdown()?.elementRef.nativeElement.contains(relatedTarget)
      ) {
        return;
      }

      // if the blur was caused by focus moving to the select trigger, don't close
      if (relatedTarget && selectState().elementRef.nativeElement.contains(relatedTarget)) {
        return;
      }

      selectState().closeDropdown();
    }

    /**
     * Focus the input field.
     * @internal
     */
    function focus(): void {
      elementRef.nativeElement.focus({ preventScroll: true });
    }

    const state = {
      elementRef,
      id,
      focus,
    } satisfies NgpSelectInputState;

    selectState().registerInput(state);

    afterNextRender(
      () => {
        if (ngDevMode) {
          const insideDropdown = selectState()
            .dropdown()
            ?.elementRef.nativeElement.contains(elementRef.nativeElement);

          if (!insideDropdown) {
            console.error(
              '[ngpSelectInput]: The input must be placed inside the element with the ngpSelectDropdown directive. For an editable trigger, use ngpCombobox instead.',
            );
          }

          if (!selectState().list()) {
            console.error(
              '[ngpSelectInput]: When using ngpSelectInput, the options must be wrapped in an element with the ngpSelectList directive (role="listbox"). Without it the input (role="combobox") is nested inside the listbox, which is invalid.',
            );
          }
        }

        // the input is only rendered once the dropdown has opened, so move focus to it.
        if (selectState().open()) {
          focus();
        }
      },
      { injector },
    );

    onDestroy(() => selectState().unregisterInput(state));

    return state;
  },
);

export function injectSelectInputState(
  options?: StateInjectionOptions,
): Signal<NgpSelectInputState> {
  return _injectSelectInputState(options) as Signal<NgpSelectInputState>;
}
