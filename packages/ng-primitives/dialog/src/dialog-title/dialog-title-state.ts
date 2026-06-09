import { Signal, ElementRef, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectDialogState } from '../dialog/dialog-state';

export interface NgpDialogTitleState {
  /** Access the component's reference. */
  readonly elementRef: ElementRef;
  /** The id of the title. */
  readonly id: Signal<string>;
  destroy: () => void;
}

export interface NgpDialogTitleProps {
  /** The id of the title. */
  readonly id?: Signal<string>;
}

export const [
  NgpDialogTitleStateToken,
  ngpDialogTitle,
  injectDialogTitleState,
  provideDialogTitleState,
] = createPrimitive('NgpDialogTitle', ({ id = signal<string>('') }: NgpDialogTitleProps) => {
  const elementRef = injectElementRef();
  const dialogState = injectDialogState();

  // Host binding
  attrBinding(elementRef, 'id', () => id());

  // Effects
  onChange(id, (id, prevId) => {
    if (prevId) {
      dialogState().removeLabelledBy(prevId);
    }

    if (id) {
      dialogState().setLabelledBy(id);
    }
  });

  function destroy(): void {
    dialogState().removeLabelledBy(id());
  }

  const state = {
    elementRef,
    id,
    destroy,
  } satisfies NgpDialogTitleState;

  onDestroy(() => {
    destroy();
  });

  return state;
});
