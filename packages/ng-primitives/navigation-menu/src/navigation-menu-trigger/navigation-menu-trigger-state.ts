import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  onMount,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuListState } from '../navigation-menu-list/navigation-menu-list-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuTrigger directive.
 */
export interface NgpNavigationMenuTriggerState {
  /**
   * The unique id for the trigger.
   */
  readonly id: Signal<string>;

  /**
   * Whether the trigger is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the associated content is open.
   */
  readonly open: Signal<boolean>;

  /**
   * The content id for aria-controls.
   */
  readonly contentId: Signal<string | undefined>;

  /**
   * Set the disabled state.
   */
  setDisabled(disabled: boolean): void;

  /**
   * Set the content id.
   * @internal
   */
  setContentId(id: string | undefined): void;

  /**
   * Toggle the content.
   */
  toggle(): void;
}

export interface NgpNavigationMenuTriggerProps {
  /**
   * Whether the trigger is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpNavigationMenuTriggerStateToken,
  ngpNavigationMenuTrigger,
  injectNavigationMenuTriggerState,
  provideNavigationMenuTriggerState,
] = createPrimitive(
  'NgpNavigationMenuTrigger',
  ({
    disabled: _disabled = signal(false),
  }: NgpNavigationMenuTriggerProps): NgpNavigationMenuTriggerState => {
    const element = injectElementRef();
    const menu = injectNavigationMenuState();
    const item = injectNavigationMenuItemState();
    const list = injectNavigationMenuListState({ optional: true });

    const id = signal(uniqueId('ngp-navigation-menu-trigger'));
    const disabled = controlled(_disabled);
    const contentId = signal<string | undefined>(undefined);

    // Whether this trigger's content is open
    const open = computed(() => item().open());

    // Register trigger element with item
    onMount(() => {
      item().setTriggerElement(element.nativeElement);

      // Register with list for indicator positioning
      const listState = list?.();
      if (listState) {
        listState.registerTrigger({
          id: id(),
          value: item().value,
          element: element.nativeElement,
        });
      }
    });

    onDestroy(() => {
      item().setTriggerElement(null);

      const listState = list?.();
      if (listState) {
        listState.unregisterTrigger(id());
      }
    });

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-haspopup', 'menu');
    attrBinding(element, 'aria-expanded', () => (open() ? 'true' : 'false'));
    attrBinding(element, 'aria-controls', contentId);
    dataBinding(element, 'data-state', () => (open() ? 'open' : 'closed'));
    dataBinding(element, 'data-disabled', disabled);

    // Event handlers
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);
    listener(element, 'click', onClick);
    listener(element, 'keydown', onKeydown);

    function onPointerEnter(): void {
      if (disabled()) return;

      menu().cancelCloseTimer();
      menu().startOpenTimer(item().value());
    }

    function onPointerLeave(): void {
      if (disabled()) return;

      menu().cancelOpenTimer();
      menu().startCloseTimer();
    }

    function onClick(): void {
      if (disabled()) return;
      toggle();
    }

    function onKeydown(event: KeyboardEvent): void {
      if (disabled()) return;

      const menuState = menu();
      const orientation = menuState.orientation();

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          toggle();
          break;
        case 'ArrowDown':
          if (orientation === 'horizontal') {
            event.preventDefault();
            if (!open()) {
              menuState.open(item().value());
            }
            // Focus the first item in the content
            item().focusFirstContentItem();
          }
          break;
        case 'ArrowUp':
          if (orientation === 'horizontal') {
            event.preventDefault();
            if (open()) {
              menuState.close();
            }
          }
          break;
        case 'ArrowRight':
          if (orientation === 'vertical') {
            event.preventDefault();
            if (!open()) {
              menuState.open(item().value());
            }
            // Focus the first item in the content
            item().focusFirstContentItem();
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'vertical') {
            event.preventDefault();
            if (open()) {
              menuState.close();
            }
          }
          break;
        case 'Escape':
          // Close any open menu when Escape is pressed on a trigger
          event.preventDefault();
          menuState.close();
          // Focus stays on the trigger (no need to explicitly focus as it's already focused)
          break;
      }
    }

    function toggle(): void {
      if (open()) {
        menu().close();
      } else {
        menu().open(item().value());
      }
    }

    function setDisabled(value: boolean): void {
      disabled.set(value);
    }

    function setContentId(value: string | undefined): void {
      contentId.set(value);
    }

    return {
      id,
      disabled,
      open,
      contentId,
      setDisabled,
      setContentId,
      toggle,
    } satisfies NgpNavigationMenuTriggerState;
  },
);
