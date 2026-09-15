import { FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { computed, inject, signal, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { controlled, createPrimitive, injectInheritedState } from 'ng-primitives/state';
import type { NgpRovingFocusItemState } from '../roving-focus-item/roving-focus-item-state';

/**
 * `Node.DOCUMENT_POSITION_FOLLOWING`, inlined because the tab stop is now resolved during
 * render, where the `Node` global is not guaranteed - a server render has no browser globals.
 */
const DOCUMENT_POSITION_FOLLOWING = 4;

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
   * Set which item holds the tab stop without moving focus. Used by items that
   * declare themselves active (e.g. the selected tab) to claim the tab stop
   * without stealing focus.
   * @param id The id of the item that should hold the tab stop.
   */
  setTabStop(id: string | null): void;
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
      return [...items()].sort((a, b) => {
        // sort the items by their position in the document
        return a.element.nativeElement.compareDocumentPosition(b.element.nativeElement) &
          DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });
    }

    /**
     * The item that has claimed the tab stop - roving navigation pushes here as focus moves,
     * and items that declare themselves active (e.g. the checked radio) push via setTabStop.
     * Read `activeItem` rather than this: a claim is a request, not the final answer.
     */
    const claimedItem = signal<string | null>(null);

    /**
     * The item that actually holds the tab stop. A disabled item is out of the tab order, so
     * if the item that claimed the stop is disabled the group falls back to its first enabled
     * item - otherwise the group as a whole drops out of the tab sequence.
     */
    const activeItem = computed(() => {
      const claimed = claimedItem();

      // the common case takes no sort - every roving keystroke lands here, and sorting by
      // compareDocumentPosition on each one is measurable on a large group
      if (items().some(item => item.id() === claimed && !item.disabled())) {
        return claimed;
      }

      return (
        getSortedItems()
          .find(item => !item.disabled())
          ?.id() ?? null
      );
    });

    /**
     * Activate an item in the roving focus group.
     * @param item The item to activate
     * @param origin The origin of the focus change
     */
    function setActiveItem(id: string | null, origin: FocusOrigin = 'program'): void {
      claimedItem.set(id);
      const item = items().find(i => i.id() === id) ?? null;

      if (item) {
        item.focus(origin);
      }
    }

    // set the tab stop without moving focus (see interface docs)
    function setTabStop(id: string | null): void {
      claimedItem.set(id);
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
      // no tab stop to seed - with nothing claimed, activeItem already resolves to the first
      // enabled item in document order, which seeding by registration order got wrong when
      // items arrive out of order (projected or conditionally rendered content).
      items.update(items => [...items, item]);
    }

    /**
     * Unregister an item with the roving focus group.
     * @param item The item to unregister
     * @internal
     */
    function unregister(item: NgpRovingFocusItemState): void {
      items.update(items => items.filter(i => i !== item));

      // drop a claim on a removed item so activeItem resolves the tab stop to the first
      // enabled item in document order rather than guessing from registration order
      if (claimedItem() === item.id()) {
        claimedItem.set(null);
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
      setTabStop,
      setOrientation,
      onKeydown,
      register,
      unregister,
      activateFirst: activateFirstItem,
      activateLast: activateLastItem,
    } satisfies NgpRovingFocusGroupState;
  },
);
