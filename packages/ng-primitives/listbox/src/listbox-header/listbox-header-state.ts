import { ElementRef, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export interface NgpListboxHeaderState {
  /** Access the component's reference. */
  readonly elementRef: ElementRef;
  /** The id of the listbox header. */
  readonly id?: Signal<string>;
}

export interface NgpListboxHeaderProps {
  /** The id of the listbox header. */
  readonly id?: Signal<string>;
}

export const [
  NgpListboxHeaderStateToken,
  ngpListboxHeader,
  injectListboxHeaderState,
  provideListboxHeaderState,
] = createPrimitive('NgpListboxHeader', ({ id = signal<string>('') }: NgpListboxHeaderProps) => {
  const elementRef = injectElementRef();

  // Host binding
  attrBinding(elementRef, 'role', 'presentation');
  attrBinding(elementRef, 'id', () => id());

  return {
    elementRef,
    id,
  } satisfies NgpListboxHeaderState;
});
