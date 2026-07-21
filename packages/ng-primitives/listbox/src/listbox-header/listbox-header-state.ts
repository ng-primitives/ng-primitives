import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectListboxSectionState } from '../listbox-section/listbox-section-state';

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
] = createPrimitive(
  'NgpListboxHeader',
  ({ id = signal(uniqueId('ngp-listbox-header')) }: NgpListboxHeaderProps) => {
    const elementRef = injectElementRef();
    const sectionState = injectListboxSectionState({ optional: true });

    // Host binding
    attrBinding(elementRef, 'role', 'presentation');
    attrBinding(elementRef, 'id', id);

    // Register this header as the label for its containing section, if there is one.
    onChange(id, (current, previous) => {
      if (previous) {
        sectionState()?.removeLabelledBy(previous);
      }
      sectionState()?.setLabelledBy(current);
    });

    onDestroy(() => sectionState()?.removeLabelledBy(id()));

    return {} satisfies NgpListboxHeaderState;
  },
);
