import {
  Component,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpOverlay, NgpOverlayTemplateContext, createOverlay } from '../overlay';

@Component({
  template: `
    <div
      #anchor
      data-testid="anchor"
      style="position: absolute; top: 100px; left: 40px; width: 50px; height: 30px;"
    >
      Anchor
    </div>
    <button data-testid="trigger" type="button" style="position: absolute; top: 500px; left: 40px;">
      Trigger
    </button>

    <ng-template #content>
      <div data-testid="overlay" style="position: absolute; width: 80px; height: 40px;">
        Overlay
      </div>
    </ng-template>
  `,
})
class OverlayHostComponent {
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

/**
 * Two anchors, each inside its own scroll container, so "which element is this bound to"
 * can be asked of the resize observer and of the close-scroll strategy independently.
 */
@Component({
  template: `
    <div
      data-testid="scroller-a"
      style="position: absolute; top: 0; left: 0; width: 120px; height: 80px; overflow: auto;"
    >
      <div #anchorA data-testid="anchor-a" style="width: 50px; height: 30px;">A</div>
      <div style="height: 400px"></div>
    </div>
    <div
      data-testid="scroller-b"
      style="position: absolute; top: 200px; left: 0; width: 120px; height: 80px; overflow: auto;"
    >
      <div #anchorB data-testid="anchor-b" style="width: 50px; height: 30px;">B</div>
      <div style="height: 400px"></div>
    </div>
    <button data-testid="trigger" type="button" style="position: absolute; top: 500px; left: 40px;">
      Trigger
    </button>

    <ng-template #content>
      <div data-testid="overlay" style="position: absolute; width: 80px; height: 40px;">
        Overlay
      </div>
    </ng-template>
  `,
})
class TwoAnchorHostComponent {
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

/**
 * Positioning re-reads the anchor on every pass, so it keeps working on its own. What does
 * not are the things that capture an element when they are built - these cover the two that
 * nothing else exercises, each from both sides, so a rebuild that never happens and one
 * wired to the wrong element are told apart.
 */
describe('overlay anchorElement bindings follow the anchor', () => {
  let overlay: NgpOverlay<unknown> | null = null;

  afterEach(() => {
    overlay?.destroy();
    overlay = null;
    document.querySelectorAll('[data-testid="overlay"]').forEach(el => el.remove());
  });

  async function openAnchoredToA(scrollBehaviour?: 'close') {
    const { fixture, getByTestId } = await render(TwoAnchorHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const anchor = signal<HTMLElement | null>(getByTestId('anchor-a'));

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        anchorElement: anchor,
        scrollBehaviour,
      }),
    );

    await overlay.show();
    await waitFor(() => expect(overlay!.position().y).toBeDefined());

    anchor.set(getByTestId('anchor-b'));
    TestBed.flushEffects();

    // The replacement subscription takes its baseline measurement in a microtask, and
    // only a reference that has measured a real size closes the overlay when it collapses.
    await waitFor(() => expect(overlay!.triggerWidth()).not.toBeNull());

    return getByTestId;
  }

  it('should stop watching the previous anchor for a collapse', async () => {
    const getByTestId = await openAnchoredToA();

    getByTestId('anchor-a').style.display = 'none';
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(overlay!.isOpen()).toBe(true);
  });

  it('should close when the new anchor collapses', async () => {
    const getByTestId = await openAnchoredToA();

    getByTestId('anchor-b').style.display = 'none';

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
  });

  it('should stop closing on scroll of the previous anchor ancestors', async () => {
    const getByTestId = await openAnchoredToA('close');

    getByTestId('scroller-a').scrollTop = 40;
    getByTestId('scroller-a').dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(overlay!.isOpen()).toBe(true);
  });

  it('should close on scroll of the new anchor ancestors', async () => {
    const getByTestId = await openAnchoredToA('close');

    getByTestId('scroller-b').scrollTop = 40;
    getByTestId('scroller-b').dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(overlay!.isOpen()).toBe(false));
  });
});

/**
 * `updateConfig()` is the overlay's only supported way to replace configuration after
 * construction. Everything anchor-bound reads a resolved signal rather than the config
 * object, so unless the two are wired together a replacement anchor is accepted and then
 * ignored - which is worse than rejecting it.
 *
 * Assertions read the computed position rather than the DOM: `computePosition` publishes
 * coordinates to a signal and leaves applying them to the content directive, so a bare
 * template is never laid out.
 */
describe('overlay anchorElement via updateConfig', () => {
  let overlay: NgpOverlay<unknown> | null = null;

  afterEach(() => {
    overlay?.destroy();
    overlay = null;
    document.querySelectorAll('[data-testid="overlay"]').forEach(el => el.remove());
  });

  it('should move an open overlay to an anchor supplied by updateConfig', async () => {
    const { fixture, getByTestId } = await render(OverlayHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const anchor = getByTestId('anchor');
    const trigger = getByTestId('trigger');

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: trigger,
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
      }),
    );

    await overlay.show();

    // Default placement is `top`, so the overlay sits just above whichever element it
    // follows. The anchor and the trigger are far enough apart that "above the anchor"
    // and "above the trigger" cannot both be true.
    await waitFor(() => expect(overlay!.position().y).toBeDefined());
    expect(overlay.position().y).toBeGreaterThan(anchor.getBoundingClientRect().bottom);

    overlay.updateConfig({ anchorElement: anchor });

    await waitFor(() => {
      TestBed.flushEffects();
      expect(overlay!.position().y).toBeLessThan(anchor.getBoundingClientRect().top);
    });
  });

  it('should follow a signal anchor supplied by updateConfig', async () => {
    const { fixture, getByTestId } = await render(OverlayHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const anchor = getByTestId('anchor');
    const trigger = getByTestId('trigger');

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: trigger,
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
      }),
    );

    await overlay.show();
    await waitFor(() => expect(overlay!.position().y).toBeDefined());

    // Swapping a plain-element config for a signal one has to take effect too, since
    // `updateConfig` replaces the anchor wholesale rather than its value.
    const anchorSignal = signal<HTMLElement | null>(anchor);
    overlay.updateConfig({ anchorElement: anchorSignal });

    await waitFor(() => {
      TestBed.flushEffects();
      expect(overlay!.position().y).toBeLessThan(anchor.getBoundingClientRect().top);
    });

    // And the swapped-in signal stays live rather than being read once - clearing it
    // sends the overlay back to the trigger.
    anchorSignal.set(null);

    await waitFor(() => {
      TestBed.flushEffects();
      expect(overlay!.position().y).toBeGreaterThan(anchor.getBoundingClientRect().bottom);
    });
  });
});
