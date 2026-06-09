import { ElementRef, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener, StateInjectionOptions } from 'ng-primitives/state';
import { NgpDialogRole } from '../config/dialog-config';
import { injectDialogRef } from './dialog-ref';

export interface NgpDialogState<R> {
  /** Access the dialog ref */
  readonly elementRef: ElementRef;
  /** The id of the dialog */
  readonly id?: Signal<string>;
  /** The dialog role. */
  readonly role?: Signal<NgpDialogRole | undefined>;
  /** Whether the dialog is a modal. */
  readonly modal?: Signal<boolean>;
  destroy: () => void;
  /** Close the dialog. */
  close: (result?: R) => void;
  /** @internal register a labelledby id */
  setLabelledBy: (id: string) => void;
  /** @internal register a describedby id */
  setDescribedBy: (id: string) => void;
  /** @internal remove a labelledby id */
  removeLabelledBy: (id: string) => void;
  /** @internal remove a describedby id */
  removeDescribedBy: (id: string) => void;
}

export interface NgpDialogProps {
  /** The id of the dialog */
  readonly id?: Signal<string>;
  /** The dialog role. */
  readonly role?: Signal<NgpDialogRole | undefined>;
  /** Whether the dialog is a modal. */
  readonly modal?: Signal<boolean>;
}

export const [NgpDialogStateToken, ngpDialog, _injectDialogState, provideDialogState] =
  createPrimitive(
    'NgpDialog',
    <T, R>({
      id = signal<string>(''),
      role = signal<NgpDialogRole | undefined>(undefined),
      modal = signal<boolean>(true),
    }: NgpDialogProps) => {
      const elementRef = injectElementRef();
      const dialogRef = injectDialogRef<T, R>();

      const labelledBy = signal<string[]>([]);
      const describedBy = signal<string[]>([]);

      // Host binding
      attrBinding(elementRef, 'tabindex', '-1');
      attrBinding(elementRef, 'id', () => id());
      attrBinding(elementRef, 'role', () => role());
      attrBinding(elementRef, 'aria-modal', () => modal());
      attrBinding(elementRef, 'aria-labelledby', () => labelledBy().join(' '));
      attrBinding(elementRef, 'aria-describedby', () => describedBy().join(' '));

      // Listener
      listener(elementRef, 'click', handleOnClick);

      function destroy(): void {
        close();
      }

      function close(result?: R): void {
        dialogRef.close(result);
      }

      function handleOnClick(event: Event): void {
        event.stopPropagation();
      }

      function setLabelledBy(id: string): void {
        labelledBy.update(ids => [...ids, id]);
      }

      function setDescribedBy(id: string): void {
        describedBy.update(ids => [...ids, id]);
      }

      function removeLabelledBy(id: string): void {
        labelledBy.update(ids => ids.filter(i => i !== id));
      }

      function removeDescribedBy(id: string): void {
        describedBy.update(ids => ids.filter(i => i !== id));
      }

      return {
        elementRef,
        id,
        role,
        modal,
        destroy,
        close,
        setLabelledBy,
        setDescribedBy,
        removeLabelledBy,
        removeDescribedBy,
      } satisfies NgpDialogState<R>;
    },
  );

export function injectDialogState<R>(options?: StateInjectionOptions): Signal<NgpDialogState<R>> {
  return _injectDialogState(options) as Signal<NgpDialogState<R>>;
}
