import { ElementRef, Signal, signal } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, styleBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

export interface NgpComboboxDropdownState {
  /** @internal Access the element reference. */
  readonly elementRef: ElementRef<HTMLElement>;
  /** The id of the checkbox. */
  readonly id: Signal<string>;
}

export interface NgpComboboxDropdownProps {
  /** The id of the dropdown. */
  readonly id?: Signal<string>;
}

export const [
  NgpComboboxDropdownStateToken,
  ngpComboboxDropdown,
  injectComboboxDropdownState,
  provideComboboxDropdownState,
] = createPrimitive(
  'NgpComboboxDropdown',
  ({ id: _id = signal(uniqueId('ngp-combobox-dropdown')) }: NgpComboboxDropdownProps) => {
    const elementRef = injectElementRef<HTMLElement>();
    const comboboxState = injectComboboxState();

    const comboboxDimensions = observeResize(() => comboboxState().elementRef.nativeElement);
    const inputDimensions = observeResize(() => comboboxState().input()?.elementRef.nativeElement);
    const buttonDimensions = observeResize(
      () => comboboxState().button()?.elementRef.nativeElement,
    );

    // Host binding
    attrBinding(elementRef, 'id', () => _id());
    styleBinding(elementRef, 'left.px', () => comboboxState().overlay()?.position()?.x ?? null);
    styleBinding(elementRef, 'top.px', () => comboboxState().overlay()?.position()?.y ?? null);
    styleBinding(
      elementRef,
      '--ngp-combobox-transform-origin',
      () => comboboxState().overlay()?.transformOrigin() ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-combobox-available-width.px',
      () => comboboxState().overlay()?.availableWidth() ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-combobox-available-height.px',
      () => comboboxState().overlay()?.availableHeight() ?? null,
    );
    styleBinding(elementRef, '--ngp-combobox-width.px', () => comboboxDimensions().width ?? null);
    styleBinding(
      elementRef,
      '--ngp-combobox-input-width.px',
      () => inputDimensions().width ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-combobox-button-width.px',
      () => buttonDimensions().width ?? null,
    );

    const state = {
      elementRef,
      id: _id,
    } satisfies NgpComboboxDropdownState;

    comboboxState().registerDropdown(state);

    return state;
  },
);
