import { computed, ElementRef, signal, Signal } from '@angular/core';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { NgpControlStatus, uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

export interface NgpComboboxInputState {
  readonly elementRef: ElementRef<HTMLInputElement>;
  /** The id of the input. */
  readonly id: Signal<string>;
  /** The id of the dropdown. */
  readonly dropdownId: Signal<string | undefined>;
  /** @internal The control status - this is required as we apply them to the combobox element as well as the input element. */
  controlStatus: Signal<NgpControlStatus>;
  /** @internal Focus the input field. */
  focus(): void;
}

export interface NgpComboboxInputProps {
  /** The id of the input. */
  readonly id?: Signal<string>;
}

export const [
  NgpComboboxInputStateToken,
  ngpComboboxInput,
  injectComboboxInputState,
  provideComboboxInputState,
] = createPrimitive(
  'NgpComboboxInput',
  ({ id: _id = signal<string>(uniqueId('ngp-combobox-input')) }: NgpComboboxInputProps) => {
    const elementRef = injectElementRef<HTMLInputElement>();
    const comboboxState = injectComboboxState();

    const dropdownId = computed(() => comboboxState().dropdown()?.id());
    let pointerFocused = false;

    // Setup interactions and form controls hooks
    ngpInteractions({ focus: true, hover: true, press: true, disabled: comboboxState().disabled });
    const controlStatus = ngpFormControl({ id: _id, disabled: comboboxState().disabled });

    // Host binding
    attrBinding(elementRef, 'role', 'combobox');
    attrBinding(elementRef, 'type', 'text');
    attrBinding(elementRef, 'autocomplete', 'off');
    attrBinding(elementRef, 'autocorrect', 'off');
    attrBinding(elementRef, 'spellcheck', 'false');
    attrBinding(elementRef, 'aria-haspopup', 'listbox');
    attrBinding(elementRef, 'aria-autocomplete', 'list');
    attrBinding(elementRef, 'id', () => _id());
    attrBinding(elementRef, 'disabled', () => comboboxState().disabled());
    attrBinding(elementRef, 'aria-controls', () =>
      comboboxState().open() ? dropdownId() : undefined,
    );
    attrBinding(elementRef, 'aria-expanded', () => comboboxState().open());
    attrBinding(elementRef, 'aria-activedescendant', () =>
      comboboxState().activeDescendantManager.id(),
    );
    dataBinding(elementRef, 'data-open', () => (comboboxState().open() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (comboboxState().disabled() ? '' : null));
    dataBinding(elementRef, 'data-multiple', () => (comboboxState().multiple() ? '' : null));

    // Event listener
    listener(elementRef, 'keydown', (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          if (comboboxState().open()) {
            comboboxState().activateNextOption();
          } else {
            comboboxState().openDropdown();
          }
          event.preventDefault();
          break;
        case 'ArrowUp':
          if (comboboxState().open()) {
            comboboxState().activatePreviousOption();
          } else {
            comboboxState().openDropdown();
            comboboxState().activeDescendantManager.last();
          }
          event.preventDefault();
          break;
        case 'Home':
          if (comboboxState().open()) {
            comboboxState().activeDescendantManager.first();
          }
          event.preventDefault();
          break;
        case 'End':
          if (comboboxState().open()) {
            comboboxState().activeDescendantManager.last();
          }
          event.preventDefault();
          break;
        case 'Enter':
          if (comboboxState().open()) {
            const activeId = comboboxState().activeDescendantManager.id();

            if (activeId) {
              const option = comboboxState()
                .sortedOptions()
                .find(opt => opt.id() === activeId);
              option?.select();
            }
          }
          event.preventDefault();
          break;
        case 'Escape':
          comboboxState().closeDropdown();
          event.preventDefault();
          break;
        case 'Backspace':
          // if the input is not empty then open the dropdown
          if (elementRef.nativeElement.value.length > 0) {
            comboboxState().openDropdown();
          }
          break;
        default:
          // Ignore keys with length > 1 (e.g., 'Shift', 'ArrowLeft', 'Enter', etc.)
          // Filter out control/meta key combos (e.g., Ctrl+C)
          if (
            event.key !== 'Unidentified' &&
            (event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey)
          ) {
            return;
          }

          // if this was a character key, we want to open the dropdown
          comboboxState().openDropdown();
      }
    });
    listener(elementRef, 'blur', (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement;

      // if the blur was caused by focus moving to the dropdown, don't close
      if (
        relatedTarget &&
        comboboxState().dropdown()?.elementRef.nativeElement.contains(relatedTarget)
      ) {
        return;
      }

      // if the blur was caused by focus moving to the button, don't close
      if (
        relatedTarget &&
        comboboxState().button()?.elementRef.nativeElement.contains(relatedTarget)
      ) {
        return;
      }

      comboboxState().closeDropdown();
      event.preventDefault();
    });
    listener(elementRef, 'focus', () => {
      if (pointerFocused) {
        pointerFocused = false;
        return;
      }

      // highlight the text in the input
      elementRef.nativeElement.setSelectionRange(0, elementRef.nativeElement.value.length);
    });
    listener(elementRef, 'pointerdown', () => {
      pointerFocused = true;
    });

    function focus(): void {
      elementRef.nativeElement.focus({ preventScroll: true });
    }

    const state = {
      elementRef,
      id: _id,
      dropdownId,
      controlStatus,
      focus,
    } satisfies NgpComboboxInputState;

    comboboxState().registerInput(state);

    return state;
  },
);
