import { Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectDialogState } from '../dialog/dialog-state';

export interface NgpDialogTitleState {
  /** The id of the title. */
  readonly id: Signal<string>;
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

  onDestroy(() => dialogState().removeLabelledBy(id()));

  return { id } satisfies NgpDialogTitleState;
});
