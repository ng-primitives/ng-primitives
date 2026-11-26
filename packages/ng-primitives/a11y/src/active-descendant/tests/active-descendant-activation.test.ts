import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createManager(count = 3) {
  const scrollIntoView = vi.fn();
  const wrap = signal(false);
  const labels = ['Apple', 'Banana', 'Cherry'];

  const manager = TestBed.runInInjectionContext(() =>
    activeDescendantManager({
      count: computed(() => count),
      getItemId: index => `row-${index}`,
      isItemDisabled: () => false,
      getItemLabel: index => labels[index],
      scrollIntoView,
      wrap,
    }),
  );

  return { manager, scrollIntoView, wrap };
}

describe('activeDescendantManager activation', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should scroll the activated item into view unless scroll is false', () => {
    const { manager, scrollIntoView } = createManager();

    manager.next();
    expect(scrollIntoView).toHaveBeenLastCalledWith(1);

    scrollIntoView.mockClear();
    manager.activateByIndex(2, { scroll: false, origin: 'pointer' });

    expect(manager.index()).toBe(2);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('should activate an item by its id', () => {
    const { manager } = createManager();

    manager.activateById('row-2');

    expect(manager.index()).toBe(2);
    expect(manager.id()).toBe('row-2');
  });

  it('should follow a wrap signal that changes at runtime', () => {
    const { manager, wrap } = createManager();

    manager.last();
    manager.next();
    expect(manager.index()).toBe(2);

    wrap.set(true);
    manager.next();
    expect(manager.index()).toBe(0);
  });

  it('should ignore pointer activation briefly after keyboard activation', () => {
    vi.useFakeTimers();
    const { manager } = createManager();

    // Keyboard navigation scrolls the list, which can move rows under a resting pointer.
    manager.typeahead('c');
    expect(manager.index()).toBe(2);

    manager.activateByIndex(0, { origin: 'pointer' });
    expect(manager.index()).toBe(2);

    vi.advanceTimersByTime(500);
    manager.activateByIndex(0, { origin: 'pointer' });
    expect(manager.index()).toBe(0);
  });

  describe('origin', () => {
    it('should be null before the first activation', () => {
      const { manager } = createManager();

      expect(manager.origin()).toBeNull();
    });

    it('should record the origin of each activation', () => {
      vi.useFakeTimers();
      const { manager } = createManager();

      manager.next({ origin: 'keyboard' });
      expect(manager.origin()).toBe('keyboard');

      vi.advanceTimersByTime(500);
      manager.activateByIndex(2, { origin: 'pointer' });
      expect(manager.origin()).toBe('pointer');

      manager.previous({ origin: 'keyboard' });
      expect(manager.origin()).toBe('keyboard');
    });

    it('should record typeahead as keyboard', () => {
      const { manager } = createManager();

      manager.typeahead('b');

      expect(manager.origin()).toBe('keyboard');
    });

    it('should record an activation of another item without an origin as program', () => {
      const { manager } = createManager();

      manager.next({ origin: 'keyboard' });
      manager.activateByIndex(2);

      expect(manager.origin()).toBe('program');
    });

    it('should record a reset without an origin as program', () => {
      const { manager } = createManager();

      manager.next({ origin: 'keyboard' });
      manager.reset();

      expect(manager.origin()).toBe('program');
    });

    it('should keep the origin when the active item is activated again without one', () => {
      const { manager } = createManager();

      manager.next({ origin: 'keyboard' });
      manager.activateByIndex(1);

      expect(manager.origin()).toBe('keyboard');
    });

    it('should keep the origin of an item activated again at a new index', () => {
      const ids = signal(['b', 'c']);
      const manager = TestBed.runInInjectionContext(() =>
        activeDescendantManager({
          count: computed(() => ids().length),
          getItemId: index => ids()[index],
          isItemDisabled: () => false,
          scrollIntoView: vi.fn(),
        }),
      );

      manager.activateByIndex(1, { origin: 'keyboard' });
      ids.set(['a', 'b', 'c']);
      manager.activateByIndex(2, { scroll: false });

      expect(manager.id()).toBe('c');
      expect(manager.origin()).toBe('keyboard');
    });

    it('should read as program once another item takes the active index', () => {
      const ids = signal(['a', 'b', 'c']);
      const manager = TestBed.runInInjectionContext(() =>
        activeDescendantManager({
          count: computed(() => ids().length),
          getItemId: index => ids()[index],
          isItemDisabled: () => false,
          scrollIntoView: vi.fn(),
        }),
      );

      manager.activateByIndex(1, { origin: 'keyboard' });
      ids.set(['x', 'y']);

      expect(manager.id()).toBe('y');
      expect(manager.origin()).toBe('program');
    });

    it('should keep the origin when a pointer activation is ignored', () => {
      vi.useFakeTimers();
      const { manager } = createManager();

      manager.next({ origin: 'keyboard' });
      manager.activateByIndex(0, { origin: 'pointer' });

      expect(manager.index()).toBe(1);
      expect(manager.origin()).toBe('keyboard');
    });
  });
});
