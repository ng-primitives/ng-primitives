import { ElementRef, signal, Signal } from '@angular/core';
import { NgpHeader } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export interface NgpListboxSectionState {
  /** Access the comonent's reference. */
  readonly elementRef: ElementRef;
}

export interface NgpListboxSectionProps {
  /**
   * Access the header of the section if it exists.
   */
  readonly header?: Signal<NgpHeader | undefined>;
}

export const [
  NgpListboxSectionStateToken,
  ngpListboxSection,
  injectListboxSectionState,
  provideListboxSectionState,
] = createPrimitive(
  'NgpListboxSection',
  ({
    // TODO: Replace deprecated API
    header = signal<NgpHeader | undefined>(undefined),
  }: NgpListboxSectionProps) => {
    const elementRef = injectElementRef();

    // Host binding
    attrBinding(elementRef, 'role', 'group');
    attrBinding(elementRef, 'aria-labelledby', () => header()?.id());

    return {
      elementRef,
    } satisfies NgpListboxSectionState;
  },
);
