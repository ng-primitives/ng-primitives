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

  /**
   * The enter state is deferred a frame. A portal detached inside that frame - the shape a
   * quick hover or a same-type overlay swap produces - must not have the queued callback
   * land afterwards and mark a node that is leaving as entering. Driven through the portal
   * rather than the animation ref so the wiring is covered, not just the helper.
   */
  it('detaching before the first frame leaves the node in the exit state', async () => {
    const portal = attachPortal();
    const node = portal.getElements()[0];
    node.getAnimations = () => [];

    await portal.detach();

    expect(node).toHaveAttribute('data-exit');
    expect(node).not.toHaveAttribute('data-enter');

    await nextFrame();
    await nextFrame();

    expect(node).toHaveAttribute('data-exit');
    expect(node).not.toHaveAttribute('data-enter');
  });

  /** The deferred enter still has to arrive for a portal that stays attached. */
  it('a portal that is not detached still reaches the enter state', async () => {
    const portal = attachPortal();
    const node = portal.getElements()[0];
    node.getAnimations = () => [];

    await nextFrame();

    expect(node).toHaveAttribute('data-enter');
    expect(node).not.toHaveAttribute('data-exit');
  });

  /**
   * `cancelDetach()` returns a node to the enter state directly rather than through a
   * frame, so cancelling an exit that pre-empted the deferred enter still enters.
   */
  it('cancelling a detach that pre-empted the first frame returns to the enter state', async () => {
    const portal = attachPortal();
    const node = portal.getElements()[0];
    const { animation } = pendingAnimation();
    node.getAnimations = () => [animation];

    const detach = portal.detach();
    expect(node).toHaveAttribute('data-exit');

    portal.cancelDetach();
    await detach;

    expect(node).toHaveAttribute('data-enter');
    expect(node).not.toHaveAttribute('data-exit');

    await nextFrame();
    await nextFrame();

    expect(node).toHaveAttribute('data-enter');
    expect(node).not.toHaveAttribute('data-exit');
  });
});

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
