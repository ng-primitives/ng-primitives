import { DOCUMENT } from '@angular/common';
import { afterNextRender, Injector, inject, signal, Signal } from '@angular/core';
import { ngpFocusTrap } from 'ng-primitives/focus-trap';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { NgpDialogRole } from '../config/dialog-config';
import { injectDialogRef } from './dialog-ref';

export interface NgpDialogState<R> {
  /** The id of the dialog */
  readonly id?: Signal<string>;
  /** The dialog role. */
  readonly role?: Signal<NgpDialogRole | undefined>;
  /** Whether the dialog is a modal. */
  readonly modal?: Signal<boolean>;
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
      const injector = inject(Injector);
      const document = inject(DOCUMENT);

      // A non-modal dialog leaves the page usable, so focus can leave it. It joins no trap, which
      // would otherwise deactivate the trap of a modal dialog below it.
      if (dialogRef.config.modal !== false) {
        ngpFocusTrap({});
      } else {
        const focusOnRender = afterNextRender({ write: focusOnOpen }, { injector });
        // A dialog closed before it rendered must not take focus during its exit animation.
        dialogRef.closed.subscribe(() => focusOnRender.destroy());
      }

      const labelledBy = signal<string[]>([]);
      const describedBy = signal<string[]>([]);

      // Host binding
      attrBinding(elementRef, 'tabindex', '-1');
      attrBinding(elementRef, 'id', id);
      attrBinding(elementRef, 'role', role);
      attrBinding(elementRef, 'aria-modal', modal);
      attrBinding(elementRef, 'aria-labelledby', () => labelledBy().join(' ') || null);
      attrBinding(elementRef, 'aria-describedby', () => describedBy().join(' ') || null);

      // Close the dialog when the directive is destroyed.
      onDestroy(() => close());

      function focusOnOpen(): void {
        if (!elementRef.nativeElement.contains(document.activeElement)) {
          elementRef.nativeElement.focus({ preventScroll: true });
        }
      }

      function close(result?: R): void {
        dialogRef.close(result);
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
        id,
        role,
        modal,
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
