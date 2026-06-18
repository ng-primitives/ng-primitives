import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { CooldownOverlay, NgpOverlayCooldownManager } from './overlay-cooldown';

/**
 * A lightweight CooldownOverlay used to exercise the manager without the full
 * NgpOverlay. Ancestry is modelled with an explicit `parent` reference, mirroring
 * NgpOverlay's injected parent overlay chain.
 */
class FakeOverlay implements CooldownOverlay {
  parent: FakeOverlay | null = null;
  readonly instantTransition = signal(false);
  readonly hideImmediate = vi.fn();

  constructor(parent: FakeOverlay | null = null) {
    this.parent = parent;
  }

  isDescendantOf(other: CooldownOverlay): boolean {
    let current: FakeOverlay | null = this.parent;
    while (current) {
      if (current === other) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
}

describe('NgpOverlayCooldownManager', () => {
  it('evicts a previously active overlay of the same type (sibling switch)', () => {
    const manager = new NgpOverlayCooldownManager();
    const a = new FakeOverlay();
    const b = new FakeOverlay();

    manager.registerActive('popover', a, 0);
    manager.registerActive('popover', b, 0);

    expect(a.hideImmediate).toHaveBeenCalledTimes(1);
    expect(b.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
  });

  it('does not evict an ancestor overlay when a nested overlay registers', () => {
    const manager = new NgpOverlayCooldownManager();
    const outer = new FakeOverlay();
    const inner = new FakeOverlay(outer);

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);

    expect(outer.hideImmediate).not.toHaveBeenCalled();
    expect(inner.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
  });

  it('restores the ancestor as active after the nested overlay unregisters', () => {
    const manager = new NgpOverlayCooldownManager();
    const outer = new FakeOverlay();
    const inner = new FakeOverlay(outer);
    const sibling = new FakeOverlay();

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);

    // The nested overlay closes, leaving the ancestor active.
    manager.unregisterActive('popover', inner);
    expect(manager.hasActiveOverlay('popover')).toBe(true);

    // Opening an unrelated sibling now evicts the ancestor (one-per-type for peers).
    manager.registerActive('popover', sibling, 0);
    expect(outer.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('evicts every non-ancestor overlay above the nearest ancestor on the stack', () => {
    const manager = new NgpOverlayCooldownManager();
    const outer = new FakeOverlay();
    const inner = new FakeOverlay(outer);
    // A second overlay nested directly in `outer` (a sibling of `inner`).
    const innerSibling = new FakeOverlay(outer);

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);
    manager.registerActive('popover', innerSibling, 0);

    // `inner` is a peer of `innerSibling`, so it is evicted; `outer` is their
    // shared ancestor and stays open.
    expect(inner.hideImmediate).toHaveBeenCalledTimes(1);
    expect(outer.hideImmediate).not.toHaveBeenCalled();
  });

  it('keeps overlays of different types independent', () => {
    const manager = new NgpOverlayCooldownManager();
    const popover = new FakeOverlay();
    const tooltip = new FakeOverlay();

    manager.registerActive('popover', popover, 0);
    manager.registerActive('tooltip', tooltip, 0);

    expect(popover.hideImmediate).not.toHaveBeenCalled();
    expect(tooltip.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
    expect(manager.hasActiveOverlay('tooltip')).toBe(true);
  });

  it('marks the evicted overlay as an instant transition when cooldown is active', () => {
    const manager = new NgpOverlayCooldownManager();
    const a = new FakeOverlay();
    const b = new FakeOverlay();

    manager.registerActive('tooltip', a, 300);
    manager.registerActive('tooltip', b, 300);

    expect(a.instantTransition()).toBe(true);
    expect(a.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('does not mark an instant transition when cooldown is disabled', () => {
    const manager = new NgpOverlayCooldownManager();
    const a = new FakeOverlay();
    const b = new FakeOverlay();

    manager.registerActive('tooltip', a, 0);
    manager.registerActive('tooltip', b, 0);

    expect(a.instantTransition()).toBe(false);
  });

  it('reports no active overlay once the last overlay unregisters', () => {
    const manager = new NgpOverlayCooldownManager();
    const a = new FakeOverlay();

    manager.registerActive('popover', a, 0);
    expect(manager.hasActiveOverlay('popover')).toBe(true);

    manager.unregisterActive('popover', a);
    expect(manager.hasActiveOverlay('popover')).toBe(false);
  });

  it('treats re-registering the active overlay as a no-op', () => {
    const manager = new NgpOverlayCooldownManager();
    const a = new FakeOverlay();

    manager.registerActive('popover', a, 0);
    manager.registerActive('popover', a, 0);

    expect(a.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
  });
});
