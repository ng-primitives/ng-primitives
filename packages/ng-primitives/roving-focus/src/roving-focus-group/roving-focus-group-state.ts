import { FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { inject, signal, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { controlled, createPrimitive, injectInheritedState } from 'ng-primitives/state';
import type { NgpRovingFocusItemState } from '../roving-focus-item/roving-focus-item-state';

export interface NgpRovingFocusGroupState {
  /**
   * The orientation of the roving focus group.
   */
  readonly orientation: Signal<NgpOrientation>;
  /**
   * Whether the roving focus group should wrap around.
   */
  readonly wrap: Signal<boolean>;
  /**
   * Whether the Home and End keys are enabled.
   */
  readonly homeEnd: Signal<boolean>;
  /**
   * Whether the roving focus group is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * The id of the currently active item.
   */
  readonly activeItem: Signal<string | null>;
  /**
   * Handle keyboard navigation.
   * @param event The keyboard event
   */
  onKeydown(event: KeyboardEvent): void;
  /**
   * Set the active item by id.
   * @param id The id of the item to activate
   * @param origin The origin of the focus change
   */
  setActiveItem(id: string | null, origin?: FocusOrigin): void;
  /**
   * Register an item with the roving focus group.
   * @param item The item to register
   */
  register(item: NgpRovingFocusItemState): void;
  /**
   * Unregister an item from the roving focus group.
   * @param item The item to unregister
   * @internal
   */
  unregister(item: NgpRovingFocusItemState): void;
  /**
   * Set the orientation of the roving focus group.
   * @param orientation The orientation value
   */
  setOrientation(orientation: NgpOrientation): void;
  /**
   * Activate the first item in the roving focus group.
   * @param origin The origin of the focus change
   */
  activateFirst(origin?: FocusOrigin): void;
  /**
   * Activate the last item in the roving focus group.
   * @param origin The origin of the focus change
   */
  activateLast(origin?: FocusOrigin): void;
}

export interface NgpRovingFocusGroupProps {
  /**
   * The orientation of the roving focus group.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Whether the roving focus group should wrap around.
   */
  readonly wrap?: Signal<boolean>;
  /**
   * Whether the Home and End keys are enabled.
   */
  readonly homeEnd?: Signal<boolean>;
  /**
   * Whether the roving focus group is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Whether to inherit state from a parent roving focus group.
   */
  readonly inherit?: boolean;
}

export const [
  NgpRovingFocusGroupStateToken,
  ngpRovingFocusGroup,
  injectRovingFocusGroupState,
  provideRovingFocusGroupState,
] = createPrimitive(
  'NgpRovingFocusGroup',
  ({
    orientation: _orientation = signal('vertical'),
    wrap = signal(false),
    homeEnd = signal(true),
    disabled = signal(false),
    inherit = true,
  }: NgpRovingFocusGroupProps): NgpRovingFocusGroupState => {
    const parentGroup = inherit
      ? injectInheritedState(() => NgpRovingFocusGroupStateToken)?.()
      : null;

    if (parentGroup) {
      return parentGroup;
    }

    const directionality = inject(Directionality);
    const items = signal<NgpRovingFocusItemState[]>([]);
    const orientation = controlled(_orientation);

    /**
     * Get the items in the roving focus group sorted by order.
     */
    function getSortedItems() {
      return items().sort((a, b) => {
        // sort the items by their position in the document
        return a.element.nativeElement.compareDocumentPosition(b.element.nativeElement) &
          Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });
    }

    /**
     * Store the active item in the roving focus group.
     */
    const activeItem = signal<string | null>(null);

    /**
     * Activate an item in the roving focus group.
     * @param item The item to activate
     * @param origin The origin of the focus change
     */
    function setActiveItem(id: string | null, origin: FocusOrigin = 'program'): void {
      activeItem.set(id);
      const item = items().find(i => i.id() === id) ?? null;

      if (item) {
        item.focus(origin);
      }
    }

    /**
     * Activate the first item in the roving focus group.
     * @param origin The origin of the focus change
     */
    function activateFirstItem(origin: FocusOrigin): void {
      // find the first item that is not disabled
      const item = getSortedItems().find(i => !i.disabled()) ?? null;

      // set the first item as the active item
      if (item) {
        setActiveItem(item.id(), origin);
      }
    }

    /**
     * Activate the last item in the roving focus group.
     * @param origin The origin of the focus change
     */
    function activateLastItem(origin: FocusOrigin): void {
      // find the last item that is not disabled
      const item = [...getSortedItems()].reverse().find(i => !i.disabled()) ?? null;

      // set the last item as the active item
      if (item) {
        setActiveItem(item.id(), origin);
      }
    }

    /**
     * Activate the next item in the roving focus group.
     * @param origin The origin of the focus change
     */
    function activateNextItem(origin: FocusOrigin): void {
      const currentActiveItem = activeItem();

      // if there is no active item, activate the first item
      if (!currentActiveItem) {
        activateFirstItem(origin);
        return;
      }

      // find the index of the active item
      const sortedItems = getSortedItems();
      const index = sortedItems.findIndex(i => i.id() === currentActiveItem);

      // find the next item that is not disabled
      const item = sortedItems.slice(index + 1).find(i => !i.disabled()) ?? null;

      // if we are at the end of the list, wrap to the beginning
      if (!item && wrap()) {
        activateFirstItem(origin);
        return;
      }

      // if there is no next item, do nothing
      if (!item) {
        return;
      }

      // set the next item as the active item
      setActiveItem(item.id(), origin);
    }

    /**
     * Activate the previous item in the roving focus group.
     * @param origin The origin of the focus change
     */
    function activatePreviousItem(origin: FocusOrigin): void {
      const currentActiveItem = activeItem();

      // if there is no active item, activate the last item
      if (!currentActiveItem) {
        activateLastItem(origin);
        return;
      }

      // find the index of the active item
      const sortedItems = getSortedItems();
      const index = sortedItems.findIndex(i => i.id() === currentActiveItem);

      // find the previous item that is not disabled
      const item =
        sortedItems
          .slice(0, index)
          .reverse()
          .find(i => !i.disabled()) ?? null;

      // if we are at the beginning of the list, wrap to the end
      if (!item && wrap()) {
        activateLastItem(origin);
        return;
      }

      // if there is no previous item, do nothing
      if (!item) {
        return;
      }

      // set the previous item as the active item
      setActiveItem(item.id(), origin);
    }

    /**
     * Handle keyboard navigation for the roving focus group.
     * @param event The keyboard event
     */
    function onKeydown(event: KeyboardEvent): void {
      if (disabled()) {
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          if (orientation() === 'vertical') {
            event.preventDefault();
            activatePreviousItem('keyboard');
          }
          break;
        case 'ArrowDown':
          if (orientation() === 'vertical') {
            event.preventDefault();
            activateNextItem('keyboard');
          }
          break;
        case 'ArrowLeft':
          if (orientation() === 'horizontal') {
            event.preventDefault();

            if (directionality.value === 'ltr') {
              activatePreviousItem('keyboard');
            } else {
              activateNextItem('keyboard');
            }
          }
          break;
        case 'ArrowRight':
          if (orientation() === 'horizontal') {
            event.preventDefault();

            if (directionality.value === 'ltr') {
              activateNextItem('keyboard');
            } else {
              activatePreviousItem('keyboard');
            }
          }
          break;
        case 'Home':
          if (homeEnd()) {
            event.preventDefault();
            activateFirstItem('keyboard');
          }
          break;
        case 'End':
          if (homeEnd()) {
            event.preventDefault();
            activateLastItem('keyboard');
          }
          break;
      }
    }

    function register(item: NgpRovingFocusItemState): void {
      items.update(items => [...items, item]);

      // if there is no active item, make the first item the tabbable item
      if (!activeItem()) {
        activeItem.set(item.id());
      }
    }

    /**
     * Unregister an item with the roving focus group.
     * @param item The item to unregister
     * @internal
     */
    function unregister(item: NgpRovingFocusItemState): void {
      items.update(items => items.filter(i => i !== item));

      // check if the unregistered item is the active item
      if (activeItem() === item.id()) {
        // if the active item is unregistered, activate the first item
        activeItem.set(items()[0]?.id() ?? null);
      }
    }

    /**
     * Set the orientation of the roving focus group.
     * @param value The orientation value
     */
    function setOrientation(value: NgpOrientation): void {
      orientation.set(value);
    }

    return {
      orientation: orientation.asReadonly(),
      wrap,
      homeEnd,
      disabled,
      activeItem,
      setActiveItem,
      setOrientation,
      onKeydown,
      register,
      unregister,
      activateFirst: activateFirstItem,
      activateLast: activateLastItem,
    } satisfies NgpRovingFocusGroupState;
  },
);
