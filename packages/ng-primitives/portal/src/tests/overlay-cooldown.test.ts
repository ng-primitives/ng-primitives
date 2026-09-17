import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CooldownOverlay, NgpOverlayCooldownManager } from '../overlay-cooldown';
import { NgpOverlayRegistry } from '../overlay-registry';

/**
 * A lightweight CooldownOverlay used to exercise the manager without the full NgpOverlay.
 * Ancestry now lives in NgpOverlayRegistry, so each fake registers an entry there - which
 * is also what a real overlay does on open.
 */
class FakeOverlay implements CooldownOverlay {
  readonly instantTransition = signal(false);
  readonly hideImmediate = vi.fn();

  constructor(private readonly overlayId: string) {}

  id(): string {
    return this.overlayId;
  }
}

let nextId = 0;

function fake(parent: FakeOverlay | null = null): FakeOverlay {
  const overlay = new FakeOverlay(`fake-${nextId++}`);
  TestBed.inject(NgpOverlayRegistry).register({
    id: overlay.id(),
    parentId: parent?.id() ?? null,
    overlay,
    getElements: () => [],
    triggerElement: document.createElement('button'),
    dismissPolicy: { outsidePress: true, escapeKey: true },
  });
  return overlay;
}

describe('NgpOverlayCooldownManager', () => {
  it('evicts a previously active overlay of the same type (sibling switch)', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const a = fake();
    const b = fake();

    manager.registerActive('popover', a, 0);
    manager.registerActive('popover', b, 0);

    expect(a.hideImmediate).toHaveBeenCalledTimes(1);
    expect(b.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
  });

  it('does not evict an ancestor overlay when a nested overlay registers', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const outer = fake();
    const inner = fake(outer);

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);

    expect(outer.hideImmediate).not.toHaveBeenCalled();
    expect(inner.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
  });

  it('restores the ancestor as active after the nested overlay unregisters', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const outer = fake();
    const inner = fake(outer);
    const sibling = fake();

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
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const outer = fake();
    const inner = fake(outer);
    // A second overlay nested directly in `outer` (a sibling of `inner`).
    const innerSibling = fake(outer);

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);
    manager.registerActive('popover', innerSibling, 0);

    // `inner` is a peer of `innerSibling`, so it is evicted; `outer` is their
    // shared ancestor and stays open.
    expect(inner.hideImmediate).toHaveBeenCalledTimes(1);
    expect(outer.hideImmediate).not.toHaveBeenCalled();
  });

  it('keeps overlays of different types independent', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const popover = fake();
    const tooltip = fake();

    manager.registerActive('popover', popover, 0);
    manager.registerActive('tooltip', tooltip, 0);

    expect(popover.hideImmediate).not.toHaveBeenCalled();
    expect(tooltip.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
    expect(manager.hasActiveOverlay('tooltip')).toBe(true);
  });

  it('marks the evicted overlay as an instant transition when cooldown is active', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const a = fake();
    const b = fake();

    manager.registerActive('tooltip', a, 300);
    manager.registerActive('tooltip', b, 300);

    expect(a.instantTransition()).toBe(true);
    expect(a.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('does not mark an instant transition when cooldown is disabled', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const a = fake();
    const b = fake();

    manager.registerActive('tooltip', a, 0);
    manager.registerActive('tooltip', b, 0);

    expect(a.instantTransition()).toBe(false);
  });

  it('reports no active overlay once the last overlay unregisters', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const a = fake();

    manager.registerActive('popover', a, 0);
    expect(manager.hasActiveOverlay('popover')).toBe(true);

    manager.unregisterActive('popover', a);
    expect(manager.hasActiveOverlay('popover')).toBe(false);
  });

  it('treats re-registering the active overlay as a no-op', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const a = fake();

    manager.registerActive('popover', a, 0);
    manager.registerActive('popover', a, 0);

    expect(a.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);
  });

  it('does not evict an active descendant when its ancestor re-registers', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const outer = fake();
    const inner = fake(outer);
    const sibling = fake();

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);

    // The ancestor starts closing and is removed from the stack while its portal
    // content is still available for the exit animation.
    manager.unregisterActive('popover', outer);

    // If that ancestor's destruction is cancelled, it re-registers while the
    // descendant is still active and must not evict the descendant.
    manager.registerActive('popover', outer, 0);

    expect(inner.hideImmediate).not.toHaveBeenCalled();
    expect(outer.hideImmediate).not.toHaveBeenCalled();
    expect(manager.hasActiveOverlay('popover')).toBe(true);

    // Sibling replacement should still evict the active descendant and ancestor.
    manager.registerActive('popover', sibling, 0);

    expect(inner.hideImmediate).toHaveBeenCalledTimes(1);
    expect(outer.hideImmediate).toHaveBeenCalledTimes(1);
    expect(sibling.hideImmediate).not.toHaveBeenCalled();
  });

  it('treats re-registering an ancestor with an active descendant as a no-op', () => {
    const manager = TestBed.inject(NgpOverlayCooldownManager);
    const outer = fake();
    const inner = fake(outer);
    const sibling = fake();

    manager.registerActive('popover', outer, 0);
    manager.registerActive('popover', inner, 0);
    manager.registerActive('popover', outer, 0);

    expect(inner.hideImmediate).not.toHaveBeenCalled();
    expect(outer.hideImmediate).not.toHaveBeenCalled();

    manager.registerActive('popover', sibling, 0);

    expect(inner.hideImmediate).toHaveBeenCalledTimes(1);
    expect(outer.hideImmediate).toHaveBeenCalledTimes(1);
    expect(sibling.hideImmediate).not.toHaveBeenCalled();
  });
});
