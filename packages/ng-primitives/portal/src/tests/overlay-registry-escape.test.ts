import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent } from '@testing-library/angular';
import { claimEscapeKey } from 'ng-primitives/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpOverlayEntry, NgpOverlayRegistry } from '../overlay-registry';

function entry(id: string): NgpOverlayEntry {
  const element = document.createElement('div');
  return {
    id,
    parentId: null,
    overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
    getElements: () => [element],
    triggerElement: document.createElement('button'),
    dismissPolicy: { outsidePress: true, escapeKey: true },
  };
}

describe('NgpOverlayRegistry escape key claims', () => {
  afterEach(() => TestBed.inject(NgpOverlayRegistry).deregister('overlay'));

  function setup() {
    const overlay = entry('overlay');
    TestBed.inject(NgpOverlayRegistry).register(overlay);
    const injector = Injector.create({ providers: [], parent: TestBed.inject(Injector) });
    return { overlay, injector };
  }

  it('dismisses the topmost overlay on an unclaimed Escape', () => {
    const { overlay, injector } = setup();
    runInInjectionContext(injector, () => claimEscapeKey(() => false));

    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(overlay.overlay.hide).toHaveBeenCalledTimes(1);
  });

  it('leaves the overlay open when a claim takes the Escape', () => {
    const { overlay, injector } = setup();
    const claim = vi.fn(() => true);
    runInInjectionContext(injector, () => claimEscapeKey(claim));

    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(claim).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
    expect(overlay.overlay.hide).not.toHaveBeenCalled();
  });

  it('drops the claim when its injector is destroyed', () => {
    const { overlay, injector } = setup();
    runInInjectionContext(injector, () => claimEscapeKey(() => true));
    injector.destroy();

    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(overlay.overlay.hide).toHaveBeenCalledTimes(1);
  });
});
