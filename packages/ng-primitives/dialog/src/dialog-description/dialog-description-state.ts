import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectDialogState } from '../dialog/dialog-state';

export interface NgpDialogDescriptionState {
  /** The id of the descriptions. */
  readonly id: Signal<string>;
}

export interface NgpDialogDescriptionProps {
  /** The id of the descriptions. */
  readonly id?: Signal<string>;
}

export const [
  NgpDialogDescriptionStateToken,
  ngpDialogDescription,
  injectDialogDescriptionState,
  provideDialogDescriptionState,
] = createPrimitive(
  'NgpDialogDescription',
  ({ id = signal<string>('') }: NgpDialogDescriptionProps) => {
    const elementRef = injectElementRef();
    const dialogState = injectDialogState();

    // Host binding
    attrBinding(elementRef, 'id', () => id());

    // Effects
    onChange(id, (id, prevId) => {
      if (prevId) {
        dialogState().removeDescribedBy(prevId);
      }

      if (id) {
        dialogState().setDescribedBy(id);
      }
    });

    onDestroy(() => dialogState().removeDescribedBy(id()));

    return { id } satisfies NgpDialogDescriptionState;
  },
);
