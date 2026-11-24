import { Signal, signal } from '@angular/core';
import { onDestroy } from 'ng-primitives/state';
import { onBooleanChange, onChange } from 'ng-primitives/utils';

interface KeepIdRegisteredOptions {
  /**
   * The id to keep registered.
   */
  readonly id: Signal<string>;
  /**
   * Whether the id should be registered. Defaults to always.
   */
  readonly active?: Signal<boolean>;
  /**
   * Register an id with the parent.
   */
  readonly add: (id: string) => void;
  /**
   * Undo one registration of an id.
   */
  readonly remove: (id: string) => void;
}

/**
 * Keep a part's id registered with its parent while `active` holds, following the id as it
 * changes. What it removes is the id it added, never the current one: a part may be destroyed
 * before a changed id is seen, or after `active` has already turned false.
 */
export function keepIdRegistered({
  id,
  active = signal(true),
  add,
  remove,
}: KeepIdRegisteredOptions): void {
  let registeredId: string | undefined;

  function register(): void {
    registeredId = id();
    add(registeredId);
  }

  function unregister(): void {
    if (registeredId === undefined) {
      return;
    }
    remove(registeredId);
    registeredId = undefined;
  }

  onBooleanChange(active, register, unregister);

  onChange(id, newId => {
    if (registeredId !== undefined && registeredId !== newId) {
      unregister();
      register();
    }
  });

  onDestroy(unregister);
}
