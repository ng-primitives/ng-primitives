import { computed, Signal, signal } from '@angular/core';
import { controlled } from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';

export interface NgpActiveDescendantManagerProps {
  /**
   * The disabled state of the active descendant group.
   * @default false
   */
  disabled?: Signal<boolean>;

  /**
   * The number of items in the active descendant group.
   */
  count: Signal<number>;

  /**
   * Get the id for the item at a given index.
   */
  getItemId: (index: number) => string | undefined;

  /**
   * Whether the item at a given index is disabled.
   */
  isItemDisabled: (index: number) => boolean;

  /**
   * Scroll the active descendant item into view.
   */
  scrollIntoView: (index: number) => void;

  /**
   * Whether active descendant should wrap around.
   * @default false
   */
  wrap?: Signal<boolean>;
}

export interface NgpActiveDescendantManagerState {
  /**
   * The index of the active descendant item.
   */
  index: Signal<number>;

  /**
   * The id of the active descendant item.
   */
  id: Signal<string | undefined>;

  /**
   * Activate an item in the active descendant group.
   */
  activateByIndex: (index: number, options?: ActivationOptions) => void;

  /**
   * Activate an item in the active descendant group by id.
   */
  activateById: (id: string, options?: ActivationOptions) => void;

  /**
   * Activate the first enabled item in the active descendant group.
   */
  first: (options?: ActivationOptions) => void;
  /**
   * Activate the last enabled item in the active descendant group.
   */
  last: (options?: ActivationOptions) => void;
  /**
   * Activate the next enabled item in the active descendant group.
   */
  next: (options?: ActivationOptions) => void;
  /**
   * Activate the previous enabled item in the active descendant group.
   */
  previous: (options?: ActivationOptions) => void;
  /**
   * Ensure there is an active descendant, this is useful when the items in the group change.
   */
  validate: () => void;
  /**
   * Reset the active descendant group, clearing the active index.
   */
  reset: (options?: ActivationOptions) => void;
}

export function activeDescendantManager({
  disabled: _disabled = signal(false),
  wrap,
  count,
  getItemId,
  isItemDisabled,
  scrollIntoView,
}: NgpActiveDescendantManagerProps) {
  const disposables = injectDisposables();

  const activeIndex = signal<number>(0);
  const disabled = controlled(_disabled);
  let isIgnoringPointer = false;

  let clearPointerIgnoreTimer: (() => void) | undefined;

  // compute the id of the active descendant
  const id = computed(() => {
    const index = activeIndex();
    return index >= 0 && index < count() ? getItemId(index) : undefined;
  });

  /**
   * Start ignoring pointer interactions temporarily.
   */
  function startIgnoringPointer(): void {
    isIgnoringPointer = true;

    // Clear any existing timer
    clearPointerIgnoreTimer?.();

    // Reset ignore state after a short delay
    clearPointerIgnoreTimer = disposables.setTimeout(() => {
      isIgnoringPointer = false;
      clearPointerIgnoreTimer = undefined;
    }, 200); // 200ms should be enough for scroll to complete
  }

  function activateByIndex(index: number, { scroll = true, origin }: ActivationOptions = {}): void {
    if (disabled() || (index >= 0 && isItemDisabled(index))) {
      return;
    }

    // if the origin is the pointer but we are ignoring pointer interactions, do nothing
    if (origin === 'pointer' && isIgnoringPointer) {
      return;
    }

    // ensure any pointer interactions triggered via scrolling due to keyboard navigation are ignored
    if (origin === 'keyboard') {
      startIgnoringPointer();
    }

    activeIndex.set(index);

    if (index < 0 || index >= count()) {
      return;
    }

    if (scroll) {
      scrollIntoView(index);
    }
  }

  function activateById(id: string, options: ActivationOptions = {}): void {
    for (let i = 0; i < count(); i++) {
      if (getItemId(i) === id) {
        activateByIndex(i, options);
        return;
      }
    }
  }

  function first(options: ActivationOptions = {}): void {
    for (let i = 0; i < count(); i++) {
      if (!isItemDisabled(i)) {
        activateByIndex(i, options);
        return;
      }
    }
  }

  function last(options: ActivationOptions = {}): void {
    for (let i = count() - 1; i >= 0; i--) {
      if (!isItemDisabled(i)) {
        activateByIndex(i, options);
        return;
      }
    }
  }

  function next(options: ActivationOptions = {}): void {
    let index = activeIndex() + 1;

    while (index !== activeIndex()) {
      if (index >= count()) {
        if (wrap?.()) {
          index = 0;
        } else {
          return;
        }
      }

      if (!isItemDisabled(index)) {
        activateByIndex(index, options);
        return;
      }

      index++;
    }
  }

  function previous(options: ActivationOptions = {}): void {
    let index = activeIndex() - 1;

    while (index !== activeIndex()) {
      if (index < 0) {
        if (wrap?.()) {
          index = count() - 1;
        } else {
          return;
        }
      }

      if (!isItemDisabled(index)) {
        activateByIndex(index, options);
        return;
      }

      index--;
    }
  }

  // any time the item list changes, check if the active index is still valid
  function validate(): void {
    const index = activeIndex();

    // if the index is out of bounds, reset it
    if (index >= count() || index < 0 || isItemDisabled(index)) {
      // find the first enabled item
      for (let i = 0; i < count(); i++) {
        if (!isItemDisabled(i)) {
          activateByIndex(i);
          return;
        }
      }
      // if no enabled items, deactivate
      activateByIndex(-1);
    }
  }

  /**
   * Reset the active descendant group, clearing the active index.
   */
  const reset = ({ scroll = false, origin }: ActivationOptions = {}) => {
    activateByIndex(-1, { scroll, origin });
  };

  return {
    id,
    index: activeIndex,
    activateByIndex,
    activateById,
    first,
    last,
    next,
    previous,
    reset,
    validate,
  } satisfies NgpActiveDescendantManagerState;
}

export interface ActivationOptions {
  /** Whether to scroll the activated item into view. */
  scroll?: boolean;
  /** Define the source of activation. */
  origin?: 'keyboard' | 'pointer';
}
