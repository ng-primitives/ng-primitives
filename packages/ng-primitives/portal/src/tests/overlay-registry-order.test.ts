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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpOverlay, NgpOverlayTemplateContext, createOverlay } from '../overlay';
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

/** An exit animation that never settles, holding the overlay mid-close. */
function pendingAnimation(): Animation {
  return {
    finished: new Promise<void>(() => undefined),
    cancel: () => undefined,
    finish: () => undefined,
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;
}

@Component({
  template: `
    <div data-testid="container"></div>
    <button data-testid="trigger" type="button">Trigger</button>

    <ng-template #content>
      <div data-testid="overlay">Overlay Content</div>
    </ng-template>
  `,
})
class OverlayOrderHostComponent {
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

describe('NgpOverlayRegistry stacking order', () => {
  let registered: string[];
  let overlay: NgpOverlay<unknown> | null = null;

  // Injected on use: `render()` configures the test module, which must come first.
  const registry = () => TestBed.inject(NgpOverlayRegistry);

  beforeEach(() => {
    registered = [];
  });

  afterEach(() => {
    overlay?.destroy();
    overlay = null;
    for (const id of registered) {
      registry().deregister(id);
    }
    document.querySelectorAll('[data-testid="overlay"]').forEach(el => el.remove());
  });

  function register(e: NgpOverlayEntry, order?: number): number {
    registered.push(e.id);
    return registry().register(e, order);
  }

  function ids(): string[] {
    return registry()
      .getEntries()
      .map(e => e.id);
  }

  async function openOverlay(
    keepMounted = false,
  ): Promise<{ opened: NgpOverlay<unknown>; element: HTMLElement }> {
    const { fixture, getByTestId } = await render(OverlayOrderHostComponent);
    fixture.autoDetectChanges(true);
    const host = fixture.componentInstance;

    const opened = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container: getByTestId('container'),
        keepMounted: signal(keepMounted),
      }),
    );

    overlay = opened;

    await opened.show();
    return { opened, element: await waitFor(() => getByTestId('overlay')) };
  }

  it('puts an entry registered with a previous order back in its place', () => {
    const a = entry('a');
    const orderA = register(a);
    register(entry('b'));
    registry().deregister('a');
    register(entry('c'));

    register(a, orderA);

    expect(ids()).toEqual(['a', 'b', 'c']);
  });

  it('keeps an overlay below one opened while its exit animation was interrupted', async () => {
    const { opened, element } = await openOverlay();
    element.getAnimations = () => [pendingAnimation()];
    const id = opened.id();

    opened.hide();
    await waitFor(() => expect(ids()).not.toContain(id));
    register(entry('opened-meanwhile'));

    await opened.show();

    // Escape still goes to the overlay opened meanwhile
    expect(ids()).toEqual([id, 'opened-meanwhile']);
  });

  it('puts a kept-mounted overlay reattached after hideImmediate() on top', async () => {
    const { opened } = await openOverlay(true);
    const id = opened.id();

    opened.hideImmediate();
    register(entry('opened-meanwhile'));
    await opened.show();

    // The reattached view is now the last node in its container, above the other overlay
    expect(ids()).toEqual(['opened-meanwhile', id]);
  });
});
