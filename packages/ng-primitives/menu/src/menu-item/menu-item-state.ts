import { FocusOrigin } from '@angular/cdk/a11y';
import { computed, inject, Injector, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { fromMutationObserver, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, listener } from 'ng-primitives/state';
import { onChange, safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectMenuState } from '../menu/menu-state';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';

export interface NgpMenuItemState {
  /**
   * Add an element that describes the item, such as its shortcut.
   * @internal
   */
  addDescribedBy(id: string): void;
  /** @internal */
  removeDescribedBy(id: string): void;
  /**
   * Add keys to the item's `aria-keyshortcuts`.
   * @internal
   */
  addKeyShortcuts(keys: string): void;
  /** @internal */
  removeKeyShortcuts(keys: string): void;
}

export interface NgpMenuItemProps {
  /**
   * Whether the menu item is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the menu should close when this item is selected.
   * @default signal(true)
   */
  readonly closeOnSelect?: Signal<boolean>;

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

      ngpButton({ disabled });

      const describedBy = signal<string[]>([]);
      const keyShortcuts = signal<string[]>([]);

      // Host bindings
      attrBinding(element, 'role', role);
      addTokens(element.nativeElement, 'aria-describedby', describedBy);
      addTokens(element.nativeElement, 'aria-keyshortcuts', keyShortcuts);

      // Event listeners
      listener(element, 'click', onClick);
      listener(element, 'keydown', handleArrowKey);
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
        // if closeOnSelect is false, we don't want to close the menu (e.g., checkbox/radio items)
        if (!trigger && closeOnSelect()) {
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

      function addDescribedBy(id: string): void {
        describedBy.update(ids => [...ids, id]);
      }

      function removeDescribedBy(id: string): void {
        describedBy.update(ids => ids.filter(i => i !== id));
      }

      function addKeyShortcuts(keys: string): void {
        keyShortcuts.update(all => [...all, keys]);
      }

      function removeKeyShortcuts(keys: string): void {
        // one of them: another shortcut of the item can have the same keys
        keyShortcuts.update(all => all.filter((_, i) => i !== all.indexOf(keys)));
      }

      return {
        addDescribedBy,
        removeDescribedBy,
        addKeyShortcuts,
        removeKeyShortcuts,
      } satisfies NgpMenuItemState;
    },
  );

/**
 * Keep the tokens that parts register in a space-separated attribute of the item, next to the
 * consumer's own value, set on the item or bound to it. An item without registered tokens leaves
 * the attribute alone.
 */
function addTokens(element: HTMLElement, attr: string, tokens: Signal<string[]>): void {
  const tokensOf = (value: string | null) => (value ?? '').split(' ').filter(Boolean);
  let ownValue: string[] = [];
  // What the item last wrote: any other value is the consumer's.
  let written: string | null | undefined;

  function update(): void {
    // Until a part registers a token, the consumer's value stays exactly as written.
    if (written === undefined && tokens().length === 0) {
      return;
    }
    const value = element.getAttribute(attr);
    if (value !== written) {
      ownValue = tokensOf(value);
    }
    // A part can register several tokens at once, such as alternative keys of one shortcut.
    const next = [...new Set([...ownValue, ...tokens().flatMap(tokensOf)])].join(' ');
    written = next || null;

    if (next === (value ?? '')) {
      return;
    }

    if (next) {
      element.setAttribute(attr, next);
    } else {
      element.removeAttribute(attr);
    }
  }

  onChange(tokens, update);

  // A binding of the consumer writes the whole attribute when its value changes.
  fromMutationObserver(element, {
    attributes: true,
    disabled: computed(() => tokens().length === 0),
  })
    .pipe(safeTakeUntilDestroyed())
    .subscribe(mutations => {
      if (mutations.some(mutation => mutation.attributeName === attr)) {
        update();
      }
    });
}
