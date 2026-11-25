import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpOverlayEntry, NgpOverlayRegistry } from '../overlay-registry';

/** Minimal entry; only the fields `closeDescendants` reads are meaningful. */
function entry(
  id: string,
  parentId: string | null,
  cascadeClose?: boolean,
): NgpOverlayEntry & {
  overlay: { hide: ReturnType<typeof vi.fn>; hideImmediate: ReturnType<typeof vi.fn> };
} {
  const element = document.createElement('div');
  return {
    id,
    parentId,
    cascadeClose,
    overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
    getElements: () => [element],
    triggerElement: document.createElement('button'),
    dismissPolicy: { outsidePress: true, escapeKey: true },
  };
}

describe('NgpOverlayRegistry cascade closing', () => {
  let registry: NgpOverlayRegistry;
  let registered: NgpOverlayEntry[];

  beforeEach(() => {
    registry = TestBed.inject(NgpOverlayRegistry);
    registered = [];
  });

  afterEach(() => {
    for (const e of registered) {
      registry.deregister(e.id);
    }
  });

  function register(...entries: ReturnType<typeof entry>[]): void {
    for (const e of entries) {
      registry.register(e);
      registered.push(e);
    }
  }

  it('closes a descendant that has not opted out', () => {
    const parent = entry('parent', null);
    const child = entry('child', 'parent');
    register(parent, child);

    registry.closeDescendants('parent');

    expect(child.overlay.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('closes a descendant that opted in explicitly', () => {
    const parent = entry('parent', null);
    const child = entry('child', 'parent', true);
    register(parent, child);

    registry.closeDescendants('parent');

    expect(child.overlay.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('leaves a descendant that opted out open', () => {
    const parent = entry('parent', null);
    const child = entry('child', 'parent', false);
    register(parent, child);

    registry.closeDescendants('parent');

    expect(child.overlay.hideImmediate).not.toHaveBeenCalled();
  });

  it('prunes the whole subtree under an entry that opted out', () => {
    // menu > dialog (opted out) > popover inside that dialog
    const menu = entry('menu', null);
    const dialog = entry('dialog', 'menu', false);
    const popover = entry('popover', 'dialog');
    register(menu, dialog, popover);

    registry.closeDescendants('menu');

    expect(dialog.overlay.hideImmediate).not.toHaveBeenCalled();
    // the popover would otherwise close while the dialog holding it stays open
    expect(popover.overlay.hideImmediate).not.toHaveBeenCalled();
  });

  it('still closes the subtree when the opted-out entry is itself the one closing', () => {
    const menu = entry('menu', null);
    const dialog = entry('dialog', 'menu', false);
    const popover = entry('popover', 'dialog');
    register(menu, dialog, popover);

    registry.closeDescendants('dialog');

    expect(popover.overlay.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('collects a grandchild registered before its own parent', () => {
    // Re-registering after an interrupted close can put an entry behind its children.
    const grandchild = entry('grandchild', 'child');
    const child = entry('child', 'parent');
    const parent = entry('parent', null);
    register(grandchild, child, parent);

    registry.closeDescendants('parent');

    expect(child.overlay.hideImmediate).toHaveBeenCalledTimes(1);
    expect(grandchild.overlay.hideImmediate).toHaveBeenCalledTimes(1);
  });

  it('reports which overlays close with an ancestor', () => {
    // menu > tooltip, menu > dialog (opted out) > popover
    const menu = entry('menu', null);
    const tooltip = entry('tooltip', 'menu');
    const dialog = entry('dialog', 'menu', false);
    const popover = entry('popover', 'dialog');
    register(menu, tooltip, dialog, popover);

    expect(registry.closesWith('tooltip', 'menu')).toBe(true);
    expect(registry.closesWith('dialog', 'menu')).toBe(false);
    expect(registry.closesWith('popover', 'menu')).toBe(false);
    expect(registry.closesWith('popover', 'dialog')).toBe(true);
    expect(registry.closesWith('menu', 'menu')).toBe(false);
  });

  describe('an overlay animating out', () => {
    function close(e: ReturnType<typeof entry>): HTMLElement {
      const focused = e.getElements()[0].appendChild(document.createElement('button'));
      registry.deregister(e.id, () => e.getElements());
      return focused;
    }

    it('still counts as inside the overlays it would have closed with', () => {
      const menu = entry('menu', null);
      const submenu = entry('submenu', 'menu');
      const nested = entry('nested', 'submenu');
      register(menu, submenu, nested);

      const focused = close(nested);
      close(submenu);

      expect(registry.isInClosingDescendant(focused, 'submenu')).toBe(true);
      expect(registry.isInClosingDescendant(focused, 'menu')).toBe(true);
      expect(registry.isInClosingDescendant(focused, 'nested')).toBe(false);
    });

    it('does not count as inside an overlay it opted out of closing with', () => {
      const menu = entry('menu', null);
      const dialog = entry('dialog', 'menu', false);
      register(menu, dialog);

      expect(registry.isInClosingDescendant(close(dialog), 'menu')).toBe(false);
    });

    it('stops counting once released or registered again', () => {
      const menu = entry('menu', null);
      const released = entry('released', 'menu');
      const reopened = entry('reopened', 'menu');
      register(menu, released, reopened);

      const inReleased = close(released);
      const inReopened = close(reopened);
      registry.releaseClosing('released');
      registry.register(reopened);

      expect(registry.isInClosingDescendant(inReleased, 'menu')).toBe(false);
      expect(registry.isInClosingDescendant(inReopened, 'menu')).toBe(false);
    });

    it('is not kept by a deregistration that names no elements', () => {
      const menu = entry('menu', null);
      const submenu = entry('submenu', 'menu');
      register(menu, submenu);
      const focused = submenu.getElements()[0].appendChild(document.createElement('button'));

      registry.deregister('submenu');

      expect(registry.isInClosingDescendant(focused, 'menu')).toBe(false);
    });
  });

  it('closes siblings that did not opt out', () => {
    const menu = entry('menu', null);
    const dialog = entry('dialog', 'menu', false);
    const tooltip = entry('tooltip', 'menu');
    register(menu, dialog, tooltip);

    registry.closeDescendants('menu');

    expect(dialog.overlay.hideImmediate).not.toHaveBeenCalled();
    expect(tooltip.overlay.hideImmediate).toHaveBeenCalledTimes(1);
  });
});
