import { computed, Signal, signal } from '@angular/core';

interface ActiveDescendantOptions {
  /**
   * The disabled state of the active descendant group.
   * @default false
   */
  disabled?: Signal<boolean>;
  /**
   * The items in the active descendant group.
   */
  items: Signal<ActiveDescendantItem[]>;
  /**
   * Whether active descendant should wrap around.
   * @default false
   */
  wrap?: Signal<boolean>;
}

export interface ActiveDescendantItem {
  /**
   * The id of the item.
   */
  id: Signal<string>;
  /**
   * Whether the item is disabled.
   */
  disabled?: Signal<boolean>;
}

export function activeDescendantManager(options: ActiveDescendantOptions) {
  const activeIndex = signal<number>(0);
  const activeItem = computed(() => options.items()?.[activeIndex()]);
  const disabled = computed(
    () => options.disabled?.() || options.items().every(item => item.disabled?.()),
  );

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
  const activate = (item: ActiveDescendantItem) => {
    if (disabled() || item.disabled?.()) {
      return;
    }

    activeIndex.set(options.items().indexOf(item));
  };

  /**
   * Activate the first enabled item in the active descendant group.
   */
  const first = () => {
    const item = options.items().findIndex(item => !item.disabled?.());

    if (item) {
      activeIndex.set(item);
    }
  };

  /**
   * Activate the last enabled item in the active descendant group.
   */
  const last = () => {
    const item = options
      .items()
      .reverse()
      .findIndex(item => !item.disabled?.());

    if (item !== -1) {
      activeIndex.set(options.items().length - 1 - item);
    }
  };

  const findNextIndex = (
    items: ActiveDescendantItem[],
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
    const items = options.items();
    const nextIndex = findNextIndex(items, activeIndex(), 1, options.wrap?.() ?? false);

    if (nextIndex !== undefined) {
      activeIndex.set(nextIndex);
    }
  };

  /**
   * Activate the previous enabled item in the active descendant group.
   */
  const previous = () => {
    const items = options.items();
    const prevIndex = findNextIndex(items, activeIndex(), -1, options.wrap?.() ?? false);

    if (prevIndex !== undefined) {
      activeIndex.set(prevIndex);
    }
  };

  return {
    activeDescendant,
    activate,
    first,
    last,
    next,
    previous,
  };
}
