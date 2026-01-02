import { computed, ElementRef, Signal, signal } from '@angular/core';
import { explicitEffect } from 'ng-primitives/internal';

interface ActiveDescendantManagerProps<T extends NgpActivatable> {
  /**
   * The disabled state of the active descendant group.
   * @default false
   */
  disabled?: Signal<boolean>;
  /**
   * The items in the active descendant group.
   */
  items: Signal<T[]>;
  /**
   * Whether active descendant should wrap around.
   * @default false
   */
  wrap?: Signal<boolean>;
  /**
   * A callback invoked when the active descendant changes.
   */
  onActiveDescendantChange?: (activeDescendant: T | undefined) => void;
}

export interface NgpActivatable {
  /**
   * The id of the item.
   */
  id: Signal<string>;
  /**
   * Whether the item is disabled.
   */
  disabled?: Signal<boolean>;
  /**
   * The element that represents the item.
   */
  elementRef: ElementRef<HTMLElement>;
}

export function activeDescendantManager<T extends NgpActivatable>({
  items,
  disabled: _disabled,
  wrap,
  onActiveDescendantChange,
}: ActiveDescendantManagerProps<T>) {
  const sortedOptions = computed(() =>
    items()
      .slice()
      .sort((a, b) => {
        const aElement = a.elementRef.nativeElement;
        const bElement = b.elementRef.nativeElement;
        return aElement.compareDocumentPosition(bElement) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      }),
  );

  const activeIndex = signal<number>(0);
  const activeItem = computed<T | undefined>(() => sortedOptions()?.[activeIndex()]);
  const disabled = computed(() => _disabled?.() || items().every(item => item.disabled?.()));

  // any time the item list changes, check if the active index is still valid
  explicitEffect([sortedOptions], ([items]) => {
    if (activeIndex() >= items.length || activeIndex() < 0) {
      activateByIndex(items.findIndex(item => !item.disabled?.()));
    }
    if (activeIndex() === -1 && items.length > 0) {
      activateByIndex(0);
    }
    if (disabled() || items.length === 0) {
      activateByIndex(-1);
    }
  });

  const activeDescendant = computed(() => {
    const item = activeItem();

    if (disabled() || !item) {
      return undefined;
    }

    return item.id();
  });

  function activateByIndex(index: number) {
    activeIndex.set(index);
    onActiveDescendantChange?.(activeItem());
  }

  /**
   * Activate an item in the active descendant group.
   * @param item The item to activate.
   */
  const activate = (item: T | undefined) => {
    if (item === undefined) {
      activateByIndex(-1);
      return;
    }

    if (disabled() || item.disabled?.()) {
      return;
    }

    activateByIndex(sortedOptions().indexOf(item));
  };

  /**
   * Activate the first enabled item in the active descendant group.
   */
  const first = () => {
    const item = sortedOptions().findIndex(item => !item.disabled?.());

    if (item !== -1) {
      activateByIndex(item);
    }
  };

  /**
   * Activate the last enabled item in the active descendant group.
   */
  const last = () => {
    const item = [...sortedOptions()].reverse().findIndex(item => !item.disabled?.());

    if (item !== -1) {
      activateByIndex(sortedOptions().length - 1 - item);
    }
  };

  const findNextIndex = (
    items: NgpActivatable[],
    currentIndex: number,
    direction: 1 | -1,
    wrap: boolean,
  ): number | undefined => {
    let index = (currentIndex + direction + items.length) % items.length;

    while (index !== currentIndex) {
      const item = items[index];
      if (item && !item.disabled?.()) {
        return index;
      }
      index = (index + direction + items.length) % items.length;

      if (
        !wrap &&
        ((direction === 1 && index === 0) || (direction === -1 && index === items.length - 1))
      ) {
        break;
      }
    }

    return undefined;
  };

  /**
   * Activate the next enabled item in the active descendant group.
   */
  const next = () => {
    const items = sortedOptions();
    const nextIndex = findNextIndex(items, activeIndex(), 1, wrap?.() ?? false);

    if (nextIndex !== undefined) {
      activateByIndex(nextIndex);
    }
  };

  /**
   * Activate the previous enabled item in the active descendant group.
   */
  const previous = () => {
    const items = sortedOptions();
    const prevIndex = findNextIndex(items, activeIndex(), -1, wrap?.() ?? false);

    if (prevIndex !== undefined) {
      activateByIndex(prevIndex);
    }
  };

  /**
   * Reset the active descendant group, clearing the active index.
   */
  const reset = () => {
    activateByIndex(-1);
  };

  return {
    activeDescendant,
    activeItem,
    activate,
    first,
    last,
    next,
    previous,
    reset,
  };
}
