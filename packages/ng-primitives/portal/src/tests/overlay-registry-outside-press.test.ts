import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpOverlayEntry, NgpOverlayRegistry } from '../overlay-registry';

describe('NgpOverlayRegistry outside press', () => {
  let registry: NgpOverlayRegistry;
  let panel: HTMLElement;
  let outside: HTMLElement;
  let entry: NgpOverlayEntry & { overlay: { hide: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    registry = TestBed.inject(NgpOverlayRegistry);
    panel = document.createElement('div');
    outside = document.createElement('div');
    document.body.append(panel, outside);

    entry = {
      id: 'popover',
      parentId: null,
      overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
      getElements: () => [panel],
      triggerElement: document.createElement('button'),
      dismissPolicy: { outsidePress: true, escapeKey: true },
    };
    registry.register(entry);
  });

  afterEach(() => {
    registry.deregister(entry.id);
    panel.remove();
    outside.remove();
  });

  function press(from: HTMLElement, to: HTMLElement): void {
    from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    to.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
  }

  it('stays open when a press starts inside and is released outside', () => {
    press(panel, outside);

    expect(entry.overlay.hide).not.toHaveBeenCalled();
  });

  it('stays open when a press starts outside and is released inside', () => {
    press(outside, panel);

    expect(entry.overlay.hide).not.toHaveBeenCalled();
  });

  it('closes when a press starts and ends outside', () => {
    press(outside, outside);

    expect(entry.overlay.hide).toHaveBeenCalledTimes(1);
  });

  it('does not carry a press origin over to the next release', () => {
    press(panel, outside);
    outside.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));

    expect(entry.overlay.hide).toHaveBeenCalledTimes(1);
  });
});
