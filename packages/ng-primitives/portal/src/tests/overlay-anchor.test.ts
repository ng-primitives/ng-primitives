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
import { NgpOverlay, createOverlay } from '../overlay';

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
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

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
