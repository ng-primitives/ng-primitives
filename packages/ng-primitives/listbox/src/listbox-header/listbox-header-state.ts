import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export type NgpListboxHeaderState = Record<string, never>;

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

  return {} satisfies NgpListboxHeaderState;
});
