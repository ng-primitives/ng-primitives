import { FocusOrigin } from '@angular/cdk/a11y';
import { inject, Injector, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener } from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';
import { injectMenuState } from '../menu/menu-state';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';

export interface NgpMenuItemState {}

export interface NgpMenuItemProps {
  /**
   * Whether the menu item is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the menu should close when this item is selected. `undefined` closes it on a click
   * or Enter and keeps it open on Space, which suits a single choice.
   * @default signal(true)
   */
  readonly closeOnSelect?: Signal<boolean | undefined>;

  /**
   * The ARIA role for the menu item.
   * @default 'menuitem'
   */
  readonly role?: string;
}

export const [NgpMenuItemStateToken, ngpMenuItem, injectMenuItemState, provideMenuItemState] =
  createPrimitive(
    'NgpMenuItem',
    ({
      disabled = signal(false),
      closeOnSelect = signal(true),
      role = 'menuitem',
    }: NgpMenuItemProps) => {
      const element = injectElementRef();
      const injector = inject(Injector);
      const parentMenu = injectMenuState({ optional: true });
      const disposables = injectDisposables();

      // The key that activated the item, read by the click it causes
      let lastKey: string | null = null;

      ngpButton({ disabled });

      // Host bindings
      attrBinding(element, 'role', role);

      // Event listeners
      listener(element, 'click', onClick);
      listener(element, 'keydown', handleArrowKey);
      listener(element, 'keydown', (event: KeyboardEvent) => (lastKey = event.key));
      // a native button clicks on Space after keyup, so forget the key once that has run
      listener(element, 'keyup', () => disposables.setTimeout(() => (lastKey = null), 0));
      listener(element, 'blur', () => (lastKey = null));
      listener(element, 'mouseenter', showSubmenuOnHover);

      // Methods
      function onClick(event: MouseEvent): void {
        // Disabled items are inert - they must not activate or close the menu.
        if (disabled()) {
          return;
        }

        // we do this here to avoid circular dependency issues
        const trigger = injector.get(NgpSubmenuTrigger, null, { self: true, optional: true });

        const origin: FocusOrigin = event.detail === 0 ? 'keyboard' : 'mouse';
        // if this is a submenu trigger, we don't want to close the menu, we want to open the submenu
        if (!trigger && (closeOnSelect() ?? !(origin === 'keyboard' && lastKey === ' '))) {
          parentMenu()?.closeAllMenus(origin);
        }
      }

      function handleArrowKey(event: Event): void {
        // disabled items are inert - they must not respond to keyboard navigation
        if (disabled()) {
          return;
        }

        if (event instanceof KeyboardEvent === false) {
          return;
        }

        // if there is no parent menu, we don't want to do anything
        const trigger = injector.get(NgpSubmenuTrigger, null, { optional: true, skipSelf: true });

        if (!trigger) {
          return;
        }

        const direction = getComputedStyle(element.nativeElement).direction;
        const isRtl = direction === 'rtl';

        const isLeftArrow = event.key === 'ArrowLeft';
        const isRightArrow = event.key === 'ArrowRight';

        if ((isLeftArrow && !isRtl) || (isRightArrow && isRtl)) {
          event.preventDefault();

          if (trigger) {
            trigger.hide('keyboard');
            // Explicitly focus the submenu trigger since submenus have restoreFocus: false
            trigger.focus('keyboard');
          }
        }
      }

      function showSubmenuOnHover(): void {
        parentMenu()?.closeSubmenus.next(element.nativeElement);
      }

      return {} satisfies NgpMenuItemState;
    },
  );
