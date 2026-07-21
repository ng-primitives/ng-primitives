import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { activeDescendantManager, NgpActiveDescendantManagerState } from 'ng-primitives/a11y';
import { describe, expect, it } from 'vitest';

interface ManagerOptions {
  /** Indices that should report as disabled. */
  disabledIndices?: number[];
  /** Whether navigation wraps around the ends. */
  wrap?: boolean;
  /** Set to false to omit `getItemLabel` (disables typeahead). */
  withLabels?: boolean;
}

function createManager(
  labels: string[],
  options: ManagerOptions = {},
): NgpActiveDescendantManagerState {
  const disabledIndices = new Set(options.disabledIndices ?? []);
  const items = signal(labels);

  return TestBed.runInInjectionContext(() =>
    activeDescendantManager({
      count: computed(() => items().length),
      getItemId: index => `opt-${index}`,
      isItemDisabled: index => disabledIndices.has(index),
      getItemLabel: options.withLabels === false ? undefined : index => items()[index],
      scrollIntoView: () => {
        /* no scrolling in the test environment */
      },
      disabled: signal(false),
      wrap: signal(options.wrap ?? false),
    }),
  );
}

describe('activeDescendantManager', () => {
  it('starts on the first item', () => {
    const manager = createManager(['A', 'B', 'C']);
    expect(manager.index()).toBe(0);
    expect(manager.id()).toBe('opt-0');
  });

  it('reset() clears the active item', () => {
    const manager = createManager(['A', 'B', 'C']);
    manager.reset();
    expect(manager.index()).toBe(-1);
    expect(manager.id()).toBeUndefined();
  });

  it('activateByIndex() activates a given item', () => {
    const manager = createManager(['A', 'B', 'C']);
    manager.activateByIndex(2);
    expect(manager.index()).toBe(2);
    expect(manager.id()).toBe('opt-2');
  });

  it('activateByIndex() ignores a disabled item', () => {
    const manager = createManager(['A', 'B', 'C'], { disabledIndices: [1] });
    manager.reset();
    manager.activateByIndex(1);
    expect(manager.index()).toBe(-1);
  });

  it('does not move the active item while the group is disabled', () => {
    const disabled = signal(false);
    const items = signal(['A', 'B', 'C']);
    const manager = TestBed.runInInjectionContext(() =>
      activeDescendantManager({
        count: computed(() => items().length),
        getItemId: index => `opt-${index}`,
        isItemDisabled: () => false,
        scrollIntoView: () => {
          /* no scrolling in the test environment */
        },
        disabled,
        wrap: signal(false),
      }),
    );

    manager.activateByIndex(2);
    expect(manager.index()).toBe(2);

    // once disabled, navigation is blocked and the active item stays put
    disabled.set(true);
    manager.activateByIndex(0);
    manager.next();
    expect(manager.index()).toBe(2);
  });

  it('first()/last() activate the first/last enabled item', () => {
    const manager = createManager(['A', 'B', 'C', 'D'], { disabledIndices: [0, 3] });
    manager.first();
    expect(manager.index()).toBe(1);
    manager.last();
    expect(manager.index()).toBe(2);
  });

  it('next()/previous() move between items and skip disabled ones', () => {
    const manager = createManager(['A', 'B', 'C'], { disabledIndices: [1] });
    manager.activateByIndex(0);
    manager.next();
    expect(manager.index()).toBe(2); // skips disabled B
    manager.previous();
    expect(manager.index()).toBe(0);
  });

  it('does not wrap at the ends by default', () => {
    const manager = createManager(['A', 'B']);
    manager.activateByIndex(1);
    manager.next();
    expect(manager.index()).toBe(1); // stays on the last item
    manager.activateByIndex(0);
    manager.previous();
    expect(manager.index()).toBe(0); // stays on the first item
  });

  it('wraps at the ends when wrap is enabled', () => {
    const manager = createManager(['A', 'B'], { wrap: true });
    manager.activateByIndex(1);
    manager.next();
    expect(manager.index()).toBe(0);
    manager.previous();
    expect(manager.index()).toBe(1);
  });

  it('validate() moves to the first enabled item when the active index is invalid', () => {
    const manager = createManager(['A', 'B', 'C'], { disabledIndices: [0] });
    manager.reset(); // index -1 is invalid
    manager.validate();
    expect(manager.index()).toBe(1);
  });

  describe('typeahead', () => {
    it('jumps to the next item whose label matches (case-insensitive)', () => {
      const manager = createManager(['Apple', 'Banana', 'Cherry']);
      manager.typeahead('C');
      expect(manager.index()).toBe(2);
    });

    it('matches on multiple characters', () => {
      const manager = createManager(['Apple', 'Banana', 'Blueberry']);
      manager.typeahead('b');
      expect(manager.index()).toBe(1); // Banana
      manager.typeahead('l');
      expect(manager.index()).toBe(2); // "bl" -> Blueberry
    });

    it('cycles through matches when a character is repeated', () => {
      const manager = createManager(['Apple', 'Apricot', 'Banana']);
      manager.typeahead('a');
      expect(manager.index()).toBe(1); // Apricot
      manager.typeahead('a');
      expect(manager.index()).toBe(0); // wraps back to Apple
    });

    it('matches the first item when nothing is active', () => {
      const manager = createManager(['Apple', 'Apricot', 'Banana']);
      manager.reset(); // no active item
      manager.typeahead('a');
      expect(manager.index()).toBe(0); // must land on Apple, not skip to Apricot
    });

    it('skips disabled items', () => {
      const manager = createManager(['Apple', 'Banana', 'Blueberry'], { disabledIndices: [1] });
      manager.typeahead('b');
      expect(manager.index()).toBe(2); // skips disabled Banana
    });

    it('is a no-op when no label accessor is provided', () => {
      const manager = createManager(['Apple', 'Banana'], { withLabels: false });
      manager.typeahead('b');
      expect(manager.index()).toBe(0);
    });
  });
});
