import { ElementRef, signal, Signal } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { attrBindingEffect, createPrimitive, styleBindingEffect } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

export interface NgpSelectDropdownState {
  /** The id of the dropdown. */
  readonly id: Signal<string>;

  readonly elementRef: ElementRef<HTMLElement>;
}

export interface NgpSelectDropdownProps {
  /** The id of the dropdown. */
  readonly id?: Signal<string>;
}

export const [
  NgpSelectDropdownStateToken,
  ngpSelectDropdown,
  injectSelectDropdownState,
  provideSelectDropdownState,
] = createPrimitive(
  'NgpSelectDropdown',
  ({ id = signal(uniqueId('ngp-select-dropdown')) }: NgpSelectDropdownProps) => {
    const element = injectElementRef();

    const selectState = injectSelectState();
    const selectDimensions = observeResize(() => selectState().elementRef.nativeElement);

    // Host bindings using helper functions
    attrBindingEffect(element, 'role', 'listbox');
    attrBindingEffect(element, 'id', id);
    styleBindingEffect(element, 'left.px', () => selectState().overlay()?.position()?.x ?? null);
    styleBindingEffect(element, 'top.px', () => selectState().overlay()?.position()?.y ?? null);
    styleBindingEffect(
      element,
      '--ngp-select-transform-origin',
      () => selectState().overlay()?.transformOrigin() ?? null,
    );
    styleBindingEffect(element, '--ngp-select-width.px', () => selectDimensions().width);

    const state: NgpSelectDropdownState = {
      id,
      elementRef: element,
    };

    selectState().registerDropdown(state);

    return state;
  },
);
