import { afterNextRender, ElementRef, inject, Injector, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { claimEscapeKey, injectElementRef } from 'ng-primitives/internal';
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

    // the overlay registry would close the dropdown in the capture phase, removing the input
    // before its own Escape handler can hand focus back to the trigger
    claimEscapeKey(event => event.target === elementRef.nativeElement);
    listener(elementRef, 'blur', onBlur);

    // options are focusable, so a click in the list would pull focus out of the search field
    const dropdown = selectState().dropdown();
    if (dropdown) {
      listener(dropdown.elementRef, 'mousedown', event => {
        if (
          selectState()
            .list()
            ?.elementRef.nativeElement.contains(event.target as Node)
        ) {
          event.preventDefault();
        }
      });
    }

    /** The input only exists while the dropdown is open, so no key here needs to open it. */
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
          const option = activeId
            ? selectState()
                .sortedOptions()
                .find(opt => opt.id() === activeId)
            : undefined;

          // a single selection closes the dropdown, which hands focus back to the trigger
          option?.select();
          event.preventDefault();
          break;
        }
        case 'Tab':
          // the dropdown is portaled to the end of the body, so close it (focusing the trigger)
          // and let the browser tab on from the select's place in the page
          if (!selectState().elementRef.nativeElement.contains(elementRef.nativeElement)) {
            selectState().closeDropdown();
          }
          break;
        case 'Escape':
          selectState().closeDropdown();
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
