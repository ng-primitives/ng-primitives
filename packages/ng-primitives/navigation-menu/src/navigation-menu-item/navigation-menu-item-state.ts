import { FocusMonitor } from '@angular/cdk/a11y';
import { computed, inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuItem directive.
 */
export interface NgpNavigationMenuItemState {
  /**
   * The unique id for the item.
   */
  readonly id: Signal<string>;

  /**
   * The value of the item.
   */
  readonly value: Signal<string>;

  /**
   * Whether the item is open.
   */
  readonly open: Signal<boolean>;

  /**
   * The trigger element.
   */
  readonly triggerElement: Signal<HTMLElement | null>;

  /**
   * The content element.
   */
  readonly contentElement: Signal<HTMLElement | null>;

  /**
   * Set the trigger element.
   * @internal
   */
  setTriggerElement(element: HTMLElement | null): void;

  /**
   * Set the content element.
   * @internal
   */
  setContentElement(element: HTMLElement | null): void;

  /**
   * Focus the first focusable item in the content.
   */
  focusFirstContentItem(): void;

  /**
   * Focus the trigger element.
   */
  focusTrigger(): void;
}

export interface NgpNavigationMenuItemProps {
  /**
   * The value of the item.
   */
  readonly value: Signal<string>;
}

export const [
  NgpNavigationMenuItemStateToken,
  ngpNavigationMenuItem,
  injectNavigationMenuItemState,
  provideNavigationMenuItemState,
] = createPrimitive(
  'NgpNavigationMenuItem',
  ({ value }: NgpNavigationMenuItemProps): NgpNavigationMenuItemState => {
    const element = injectElementRef();
    const menu = injectNavigationMenuState();
    const focusMonitor = inject(FocusMonitor);

    const id = signal(uniqueId('ngp-navigation-menu-item'));
    const triggerElement = signal<HTMLElement | null>(null);
    const contentElement = signal<HTMLElement | null>(null);

    // Whether this item is open
    const open = computed(() => menu().value() === value());

    // Register with the menu
    menu().registerItem({
      value,
      triggerElement,
      contentElement,
    });

    // Unregister on destroy
    onDestroy(() => menu().unregisterItem(value()));

    // Host bindings
    dataBinding(element, 'data-state', () => (open() ? 'open' : 'closed'));

    function setTriggerElement(el: HTMLElement | null): void {
      triggerElement.set(el);
    }

    function setContentElement(el: HTMLElement | null): void {
      contentElement.set(el);
    }

    /**
     * Focus the first focusable element in the content.
     * Uses a simple query for elements with role="menuitem".
     */
    function focusFirstContentItem(): void {
      const content = contentElement();
      if (!content) return;

      // Find the first menuitem in the content
      const firstItem = content.querySelector('[role="menuitem"]') as HTMLElement | null;
      if (firstItem) {
        focusMonitor.focusVia(firstItem, 'keyboard');
      }
    }

    function focusTrigger(): void {
      const trigger = triggerElement();
      if (trigger) {
        focusMonitor.focusVia(trigger, 'keyboard');
      }
    }

    return {
      id,
      value,
      open,
      triggerElement,
      contentElement,
      setTriggerElement,
      setContentElement,
      focusFirstContentItem,
      focusTrigger,
    } satisfies NgpNavigationMenuItemState;
  },
);
