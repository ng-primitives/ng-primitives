import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent } from '@testing-library/angular';
import { claimEscapeKey } from 'ng-primitives/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpOverlayEntry, NgpOverlayRegistry } from '../overlay-registry';

describe('NgpOverlayRegistry escape key claims', () => {
  let overlayElement: HTMLElement;

  afterEach(() => {
    TestBed.inject(NgpOverlayRegistry).deregister('overlay');
    overlayElement.remove();
  });

  function setup(claim: (event: KeyboardEvent) => boolean) {
    overlayElement = document.body.appendChild(document.createElement('div'));
    const inside = overlayElement.appendChild(document.createElement('input'));
    const overlay: NgpOverlayEntry = {
      id: 'overlay',
      parentId: null,
      overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
      getElements: () => [overlayElement],
      triggerElement: document.createElement('button'),
      dismissPolicy: { outsidePress: true, escapeKey: true },
    };
    TestBed.inject(NgpOverlayRegistry).register(overlay);
    const injector = Injector.create({ providers: [], parent: TestBed.inject(Injector) });
    runInInjectionContext(injector, () => claimEscapeKey(claim));
    return { hide: overlay.overlay.hide, inside, injector };
  }

  it('dismisses the topmost overlay on an unclaimed Escape', () => {
    const { hide, inside } = setup(() => false);

    fireEvent.keyDown(inside, { key: 'Escape' });

    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('leaves the overlay open when a claim inside it takes the Escape', () => {
    const claim = vi.fn(() => true);
    const { hide, inside } = setup(claim);

    fireEvent.keyDown(inside, { key: 'Escape' });

    expect(claim).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
    expect(hide).not.toHaveBeenCalled();
  });

  it('still dismisses an overlay that does not contain the claimed key', () => {
    const { hide } = setup(() => true);

    fireEvent.keyDown(document.body, { key: 'Escape' });

    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('keeps a shared claim while another registration of it is alive', () => {
    const claim = () => true;
    const { hide, inside, injector } = setup(claim);
    const other = Injector.create({ providers: [], parent: TestBed.inject(Injector) });
    runInInjectionContext(other, () => claimEscapeKey(claim));

    injector.destroy();
    fireEvent.keyDown(inside, { key: 'Escape' });

    expect(hide).not.toHaveBeenCalled();
    other.destroy();
  });

  it('drops the claim when its injector is destroyed', () => {
    const { hide, inside, injector } = setup(() => true);
    injector.destroy();

    fireEvent.keyDown(inside, { key: 'Escape' });

    expect(hide).toHaveBeenCalledTimes(1);
  });
});

describe('NgpOverlayRegistry Escape for an overlay that takes it only inside', () => {
  let below: HTMLElement;
  let above: HTMLElement;
  let hideBelow: ReturnType<typeof vi.fn>;
  let hideAbove: ReturnType<typeof vi.fn>;

  function entry(id: string, element: HTMLElement, hide: () => void): NgpOverlayEntry {
    return {
      id,
      parentId: null,
      overlay: { hide, hideImmediate: vi.fn() },
      getElements: () => [element],
      triggerElement: document.createElement('button'),
      dismissPolicy: { outsidePress: false, escapeKey: true },
    };
  }

  afterEach(() => {
    const registry = TestBed.inject(NgpOverlayRegistry);
    registry.deregister('below');
    registry.deregister('above');
    below.remove();
    above.remove();
  });

  function setup(): void {
    below = document.body.appendChild(document.createElement('div'));
    above = document.body.appendChild(document.createElement('div'));
    hideBelow = vi.fn();
    hideAbove = vi.fn();
    const registry = TestBed.inject(NgpOverlayRegistry);
    registry.register(entry('below', below, hideBelow));
    registry.register({ ...entry('above', above, hideAbove), escapeKeyInsideOnly: true });
  }

  it('passes an Escape pressed outside it to the overlay below', () => {
    setup();

    fireEvent.keyDown(below, { key: 'Escape' });

    expect(hideAbove).not.toHaveBeenCalled();
    expect(hideBelow).toHaveBeenCalledTimes(1);
  });

  it('takes an Escape pressed inside it', () => {
    setup();

    fireEvent.keyDown(above, { key: 'Escape' });

    expect(hideAbove).toHaveBeenCalledTimes(1);
    expect(hideBelow).not.toHaveBeenCalled();
  });
});
