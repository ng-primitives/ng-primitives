import { signal, Signal, ElementRef } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectDialogState } from '../dialog/dialog-state';

export interface NgpDialogDescriptionState {
  /** Access the component's reference. */
  readonly elementRef: ElementRef;
  /** The id of the descriptions. */
  readonly id: Signal<string>;
  destroy: () => void;
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
    attrBinding(elementRef, 'id', id);

    // Effects
    onChange(id, (id, prevId) => {
      if (prevId) {
        dialogState().removeDescribedBy(prevId);
      }

      if (id) {
        dialogState().setDescribedBy(id);
      }
    });

    function destroy(): void {
      dialogState().removeDescribedBy(id());
    }

    const state = {
      elementRef,
      id,
      destroy,
    } satisfies NgpDialogDescriptionState;

    onDestroy(() => {
      destroy();
    });

    return state;
  },
);
