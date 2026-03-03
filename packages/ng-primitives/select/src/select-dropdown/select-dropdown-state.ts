import { ElementRef, Signal, signal } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { attrBindingEffect, createPrimitive, styleBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

export interface NgpSelectDropdownState {
  /**
   * @internal Access the element reference.
   */
  readonly elementRef: ElementRef<HTMLElement>;

  /** The id of the dropdown. */
  readonly id: Signal<string>;
}

export interface NgpSelectDropdownProps {
  /** The id of the dropdown. */
  readonly id?: Signal<string>;

  /** The width of the select element. */
  readonly selectWidth?: Signal<number | null>;
}

export const [
  NgpSelectDropdownStateToken,
  ngpSelectDropdown,
  _injectSelectDropdownState,
  provideSelectDropdownState,
] = createPrimitive(
  'NgpSelectDropdown',
  ({ id: _id = signal(uniqueId('ngp-select-dropdown')) }: NgpSelectDropdownProps) => {
    const elementRef = injectElementRef<HTMLElement>();
    const selectState = injectSelectState();

    const selectDimensions = observeResize(() => selectState().elementRef.nativeElement);
    // Host bindings
    attrBindingEffect(elementRef, 'role', 'listbox');
    attrBindingEffect(elementRef, 'id', _id);
    styleBinding(elementRef, 'left.px', () => selectState().overlay()?.position()?.x ?? null);
    styleBinding(elementRef, 'top.px', () => selectState().overlay()?.position()?.y ?? null);
    styleBinding(
      elementRef,
      '--ngp-select-transform-origin',
      () => selectState().overlay()?.transformOrigin() ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-select-available-width.px',
      () => selectState().overlay()?.availableWidth() ?? null,
    );
    styleBinding(
      elementRef,
      '--ngp-select-available-height.px',
      () => selectState().overlay()?.availableHeight() ?? null,
    );
    styleBinding(elementRef, '--ngp-select-width.px', () => selectDimensions().width ?? null);

    return {
      elementRef,
      id: _id,
    } satisfies NgpSelectDropdownState;
  },
);

export function injectSelectDropdownState(): Signal<NgpSelectDropdownState> {
  return _injectSelectDropdownState() as Signal<NgpSelectDropdownState>;
}
