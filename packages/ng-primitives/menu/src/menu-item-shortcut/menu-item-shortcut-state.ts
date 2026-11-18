import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, onDestroy } from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectMenuItemState } from '../menu-item/menu-item-state';

export interface NgpMenuItemShortcutState {
  /** The id of the shortcut. */
  readonly id: Signal<string>;
}

export interface NgpMenuItemShortcutProps {
  /** The id of the shortcut. */
  readonly id?: Signal<string>;
  /**
   * The keys of the shortcut in the `aria-keyshortcuts` format, such as `Control+D`, set on the
   * menu item.
   */
  readonly keys?: Signal<string | undefined>;
}

export const [
  NgpMenuItemShortcutStateToken,
  ngpMenuItemShortcut,
  injectMenuItemShortcutState,
  provideMenuItemShortcutState,
] = createPrimitive(
  'NgpMenuItemShortcut',
  ({ id = signal(''), keys = signal(undefined) }: NgpMenuItemShortcutProps) => {
    const element = injectElementRef();
    const menuItem = injectMenuItemState();

    attrBinding(element, 'id', id);
    // the item's name is its label; the shortcut describes it instead of being read as part of it
    attrBinding(element, 'aria-hidden', 'true');

    onChange(id, (current, previous) => {
      if (previous) {
        menuItem().removeDescribedBy(previous);
      }
      menuItem().addDescribedBy(current);
    });

    onChange(keys, (current, previous) => {
      if (previous) {
        menuItem().removeKeyShortcuts(previous);
      }
      if (current) {
        menuItem().addKeyShortcuts(current);
      }
    });

    onDestroy(() => {
      menuItem().removeDescribedBy(id());
      const current = keys();
      if (current) {
        menuItem().removeKeyShortcuts(current);
      }
    });

    return { id } satisfies NgpMenuItemShortcutState;
  },
);
