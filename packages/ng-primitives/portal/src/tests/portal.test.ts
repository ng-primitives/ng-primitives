import { Component, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpComponentPortal } from '../portal';

@Component({
  selector: 'ngp-portal-test',
  template: 'content',
})
class PortalContent {}

describe('NgpComponentPortal', () => {
  let container: HTMLElement;
  let attached: NgpComponentPortal<PortalContent> | undefined;

  // The view is attached to the root ApplicationRef, not to a fixture, so
  // removing the container alone leaves it live for the rest of the run.
  afterEach(() => {
    attached?.destroyView();
    attached = undefined;
    container?.remove();
  });

  /**
   * A fake animation that never settles on its own, so a detach waiting on it
   * stays pending until something ends it. `endTime` feeds the defensive
   * fallback timeout and is large enough never to fire during a test.
   */
  function pendingAnimation(): { animation: Animation; finished: () => boolean } {
    let didFinish = false;
    const animation = {
      finished: new Promise<void>(() => undefined),
      cancel: () => undefined,
      finish: () => (didFinish = true),
      effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
    } as unknown as Animation;
    return { animation, finished: () => didFinish };
  }

  function attachPortal() {
    container = document.createElement('div');
    document.body.appendChild(container);

    const portal = new NgpComponentPortal(PortalContent, null, TestBed.inject(Injector));
    portal.attach(container);
    attached = portal;
    return portal;
  }

  it('finishDetach() ends an exit animation still in flight', async () => {
    const portal = attachPortal();
    const { animation, finished } = pendingAnimation();
    portal.getElements()[0].getAnimations = () => [animation];

    const detach = portal.detach();
    portal.finishDetach();

    await expect(detach).resolves.toBeUndefined();
    expect(finished()).toBe(true);
    expect(portal.getAttached()).toBe(false);
  });

  it('finishDetach() does nothing when no detach is in progress', () => {
    const portal = attachPortal();
    const { finished } = pendingAnimation();

    portal.finishDetach();

    expect(finished()).toBe(false);
    expect(portal.getAttached()).toBe(true);
  });
});
