import { computed, effect, ElementRef, Signal, signal } from '@angular/core';

interface ActiveDescendantManagerOptions<T extends NgpActivatable> {
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

export function activeDescendantManager<T extends NgpActivatable>(
  options: ActiveDescendantManagerOptions<T>,
) {
  const sortedOptions = () =>
    options
      .items()
      .slice()
      .sort((a, b) => {
        const aElement = a.elementRef.nativeElement;
        const bElement = b.elementRef.nativeElement;
        return aElement.compareDocumentPosition(bElement) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });

  const activeIndex = signal<number>(0);
  const activeItem = computed<T | undefined>(() => sortedOptions()?.[activeIndex()]);
  const disabled = computed(
    () => options.disabled?.() || options.items().every(item => item.disabled?.()),
  );

  // any time the item list changes, check if the active index is still valid
  effect(() => {
    const items = sortedOptions();
    if (activeIndex() >= items.length || activeIndex() < 0) {
      activeIndex.set(items.findIndex(item => !item.disabled?.()));
    }
    if (activeIndex() === -1 && items.length > 0) {
      activeIndex.set(0);
    }
    if (disabled() || items.length === 0) {
      activeIndex.set(-1);
    }
  });

  const activeDescendant = computed(() => {
    const item = activeItem();

    if (disabled() || !item) {
      return undefined;
    }

    return item.id();
  });

  /**
   * Activate an item in the active descendant group.
   * @param item The item to activate.
   */
  const activate = (item: T | undefined) => {
    if (item === undefined) {
      activeIndex.set(-1);
      return;
    }

    if (disabled() || item.disabled?.()) {
      return;
    }

    activeIndex.set(sortedOptions().indexOf(item));
  };

  /**
   * Activate the first enabled item in the active descendant group.
   */
  const first = () => {
    const item = sortedOptions().findIndex(item => !item.disabled?.());

    if (item) {
      activeIndex.set(item);
    }
  };

  /**
   * Activate the last enabled item in the active descendant group.
   */
  const last = () => {
    const item = sortedOptions()
      .reverse()
      .findIndex(item => !item.disabled?.());

    if (item !== -1) {
      activeIndex.set(sortedOptions().length - 1 - item);
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
    const nextIndex = findNextIndex(items, activeIndex(), 1, options.wrap?.() ?? false);

    if (nextIndex !== undefined) {
      activeIndex.set(nextIndex);
    }
  };

  /**
   * Activate the previous enabled item in the active descendant group.
   */
  const previous = () => {
    const items = sortedOptions();
    const prevIndex = findNextIndex(items, activeIndex(), -1, options.wrap?.() ?? false);

    if (prevIndex !== undefined) {
      activeIndex.set(prevIndex);
    }
  };

  /**
   * Reset the active descendant group, clearing the active index.
   */
  const reset = () => {
    activeIndex.set(-1);
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
