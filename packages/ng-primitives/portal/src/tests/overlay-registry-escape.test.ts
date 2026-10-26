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
