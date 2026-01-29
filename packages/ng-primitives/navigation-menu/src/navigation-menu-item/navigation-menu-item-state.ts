import { FocusMonitor, InteractivityChecker } from '@angular/cdk/a11y';
import { computed, inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
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
    const interactivityChecker = inject(InteractivityChecker);

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
    attrBinding(element, 'role', 'none');
    dataBinding(element, 'data-state', () => (open() ? 'open' : 'closed'));

    function setTriggerElement(el: HTMLElement | null): void {
      triggerElement.set(el);
    }

    function setContentElement(el: HTMLElement | null): void {
      contentElement.set(el);
    }

    /**
     * Focus the first focusable element in the content.
     * Uses CDK InteractivityChecker to find focusable elements.
     * Includes retry logic since content may be created asynchronously.
     */
    function focusFirstContentItem(): void {
      const tryFocus = (attempts = 0): void => {
        const content = contentElement();
        if (!content) {
          // Content not ready yet, retry after a frame (max 10 attempts)
          if (attempts < 10) {
            requestAnimationFrame(() => tryFocus(attempts + 1));
          }
          return;
        }

        // Find the first focusable element in the content using InteractivityChecker
        const firstFocusable = findFirstFocusableElement(content);
        if (firstFocusable) {
          focusMonitor.focusVia(firstFocusable, 'keyboard');
        } else if (attempts < 10) {
          // Content exists but no focusable element found yet, retry
          requestAnimationFrame(() => tryFocus(attempts + 1));
        }
      };

      tryFocus();
    }

    /**
     * Find the first focusable element within a container using tree walker.
     */
    function findFirstFocusableElement(container: HTMLElement): HTMLElement | null {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node: Node) => {
          const el = node as HTMLElement;
          return interactivityChecker.isFocusable(el) && interactivityChecker.isTabbable(el)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        },
      });

      return walker.nextNode() as HTMLElement | null;
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
