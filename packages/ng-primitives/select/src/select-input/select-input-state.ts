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
    attrBinding(elementRef, 'role', 'searchbox');
    attrBinding(elementRef, 'type', 'text');
    attrBinding(elementRef, 'autocomplete', 'off');
    attrBinding(elementRef, 'autocorrect', 'off');
    attrBinding(elementRef, 'spellcheck', 'false');
    attrBinding(elementRef, 'id', id);

    // Dynamic host bindings
    attrBinding(elementRef, 'disabled', () => (selectState().disabled() ? '' : null));
    dataBinding(elementRef, 'data-open', () => (selectState().open() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (selectState().disabled() ? '' : null));
    dataBinding(elementRef, 'data-multiple', () => (selectState().multiple() ? '' : null));

    // Event listeners
    listener(elementRef, 'keydown', handleKeydown);
    listener(elementRef, 'blur', onBlur);

    /** Handle keydown events for accessibility. */
    function handleKeydown(event: KeyboardEvent): void {
      switch (event.key) {
        case 'ArrowDown':
          if (selectState().open()) {
            selectState().activateNextOption();
          } else {
            selectState().openDropdown();
          }
          event.preventDefault();
          break;
        case 'ArrowUp':
          if (selectState().open()) {
            selectState().activatePreviousOption();
          } else {
            selectState().openDropdown();
            selectState().activeDescendantManager.last();
          }
          event.preventDefault();
          break;
        case 'Home':
          if (selectState().open()) {
            selectState().activeDescendantManager.first({ origin: 'keyboard' });
          }
          event.preventDefault();
          break;
        case 'End':
          if (selectState().open()) {
            selectState().activeDescendantManager.last({ origin: 'keyboard' });
          }
          event.preventDefault();
          break;
        case 'Enter':
          if (selectState().open()) {
            const activeId = selectState().activeDescendantManager.id();

            if (activeId) {
              const option = selectState()
                .sortedOptions()
                .find(opt => opt.id() === activeId);
              option?.select();
            }

            // if a single selection closed the dropdown, return focus to the trigger
            if (!selectState().open()) {
              selectState().focus();
            }
          }
          event.preventDefault();
          break;
        case 'Escape':
          selectState().closeDropdown();
          selectState().focus();
          event.preventDefault();
          break;
        case 'Backspace':
          // if the input is not empty then open the dropdown
          if (elementRef.nativeElement.value.length > 0) {
            selectState().openDropdown();
          }
          break;
        default:
          // Ignore keys with length > 1 (e.g., 'Shift', 'ArrowLeft', etc.)
          // and control/meta key combos (e.g., Ctrl+C)
          if (
            event.key !== 'Unidentified' &&
            (event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey)
          ) {
            return;
          }

          // if this was a character key, we want to open the dropdown
          selectState().openDropdown();
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

    // when the input is rendered (e.g. the dropdown opened), move focus to it
    afterNextRender(() => focus(), { injector });

    onDestroy(() => selectState().unregisterInput(state));

    return state;
  },
);

export function injectSelectInputState(
  options?: StateInjectionOptions,
): Signal<NgpSelectInputState> {
  return _injectSelectInputState(options) as Signal<NgpSelectInputState>;
}
