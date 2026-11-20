import { ElementRef, Signal, signal } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy, styleBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';

export interface NgpAutocompleteDropdownState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** The id of the dropdown. */
  readonly id: Signal<string>;
}

export interface NgpAutocompleteDropdownProps {
  /** The id of the dropdown. */
  readonly id?: Signal<string>;
}

export const [
  NgpAutocompleteDropdownStateToken,
  ngpAutocompleteDropdown,
  injectAutocompleteDropdownState,
  provideAutocompleteDropdownState,
] = createPrimitive(
  'NgpAutocompleteDropdown',
  ({
    id = signal(uniqueId('ngp-autocomplete-dropdown')),
  }: NgpAutocompleteDropdownProps): NgpAutocompleteDropdownState => {
    const elementRef = injectElementRef<HTMLElement>();
    const state = injectAutocompleteState();

    const autocompleteDimensions = observeResize(() => state().elementRef.nativeElement);
    const inputDimensions = observeResize(() => state().input()?.elementRef.nativeElement);
    const buttonDimensions = observeResize(() => state().button()?.elementRef.nativeElement);

    // The autocomplete's own overlay, not one injected: a dropdown rendered in place would find an
    // enclosing overlay and replace that overlay's properties.
    state().overlay()?.registerAvailableSizePrefix('--ngp-autocomplete');

    // Host bindings
    attrBinding(elementRef, 'role', 'listbox');
    attrBinding(elementRef, 'id', id);
    styleBinding(elementRef, 'left.px', () => state().overlay()?.position()?.x ?? null);
    styleBinding(elementRef, 'top.px', () => state().overlay()?.position()?.y ?? null);
    styleBinding(
      elementRef,
      '--ngp-autocomplete-transform-origin',
      () => state().overlay()?.transformOrigin() ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-autocomplete-available-width.px',
      () => state().overlay()?.availableWidth() ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-autocomplete-available-height.px',
      () => state().overlay()?.availableHeight() ?? null,
    );
    styleBinding(elementRef, '--ngp-autocomplete-width.px', () => autocompleteDimensions().width);
    styleBinding(elementRef, '--ngp-autocomplete-input-width.px', () => inputDimensions().width);
    styleBinding(elementRef, '--ngp-autocomplete-button-width.px', () => buttonDimensions().width);

    const dropdownState = {
      elementRef,
      id,
    } satisfies NgpAutocompleteDropdownState;

    state().registerDropdown(dropdownState);
    onDestroy(() => state().unregisterDropdown(dropdownState));

    return dropdownState;
  },
);
