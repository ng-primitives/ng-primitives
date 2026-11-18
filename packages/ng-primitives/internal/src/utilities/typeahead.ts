import { injectDisposables } from 'ng-primitives/utils';

/** Finds the item typed characters lead to, as in the WAI-ARIA listbox and menu patterns. */
export interface NgpTypeahead {
  /**
   * Add a typed character to the search and return the index of the item it leads to, or -1.
   * Characters typed within half a second build one prefix; repeating one character cycles
   * through the items that start with it.
   * @param key The printable character typed
   * @param count The number of items
   * @param activeIndex The index of the active item, or -1 when there is none
   * @param label The label of the item at an index
   * @param disabled Whether the item at an index is disabled
   */
  search(
    key: string,
    count: number,
    activeIndex: number,
    label: (index: number) => string,
    disabled: (index: number) => boolean,
  ): number;
  /** Whether characters typed recently are still building a search. */
  isSearching(): boolean;
}

/** Create a typeahead search. Call it in an injection context: it clears itself on a timer. */
export function createTypeahead(): NgpTypeahead {
  const disposables = injectDisposables();
  let buffer = '';
  let clearBuffer: (() => void) | undefined;

  function search(
    key: string,
    count: number,
    activeIndex: number,
    label: (index: number) => string,
    disabled: (index: number) => boolean,
  ): number {
    buffer += key.toLowerCase();

    // clear the buffer shortly after the last keystroke so a new search can begin
    clearBuffer?.();
    clearBuffer = disposables.setTimeout(() => {
      buffer = '';
      clearBuffer = undefined;
    }, 500);

    // when every buffered character is the same, treat it as a single-character
    // search that starts after the current item, so repeating a character cycles
    // through the items whose label starts with it
    const hasActive = activeIndex >= 0;
    const isRepeatedChar = [...buffer].every(char => char === buffer[0]);
    const prefix = isRepeatedChar ? buffer[0] : buffer;
    // only skip past the current item when there is one to cycle from; with no
    // active item the search must start at index 0 so the first match is found
    const startOffset = isRepeatedChar && hasActive ? 1 : 0;
    const base = hasActive ? activeIndex : 0;

    for (let i = 0; i < count; i++) {
      const index = (base + startOffset + i) % count;

      if (!disabled(index) && label(index).toLowerCase().trim().startsWith(prefix)) {
        return index;
      }
    }

    return -1;
  }

  return { search, isSearching: () => buffer !== '' };
}
