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
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpOverlay, NgpOverlayTemplateContext, createOverlay } from '../overlay';

@Component({
  template: `
    <div id="container-a" data-testid="container-a"></div>
    <div id="container-b" data-testid="container-b"></div>
    <button data-testid="trigger" type="button">Trigger</button>

    <ng-template #content>
      <div data-testid="overlay">Overlay Content</div>
    </ng-template>
    <ng-template #other>
      <div data-testid="other">Other Content</div>
    </ng-template>
  `,
})
class OverlayContainerHostComponent {
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');
  readonly other = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('other');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

describe('NgpOverlay container resolution', () => {
  let overlay: NgpOverlay<unknown> | null = null;

  afterEach(() => {
    vi.restoreAllMocks();
    overlay?.destroy();
    overlay = null;
    document
      .querySelectorAll('[data-testid="overlay"], [data-testid="other"]')
      .forEach(el => el.remove());
  });

  it('should render overlay into updated container when container signal changes between opens (string selector)', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const container = signal<string | HTMLElement | null>('#container-a');

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container,
      }),
    );

    await overlay.show();
    await waitFor(() => {
      const containerA = getByTestId('container-a');
      expect(containerA.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });

    overlay.hide({ immediate: true });
    await waitFor(() => {
      expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    });

    container.set('#container-b');

    await overlay.show();
    await waitFor(() => {
      const containerB = getByTestId('container-b');
      expect(containerB.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });
  });

  it('should render overlay into updated container when container signal changes between opens (HTMLElement)', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const containerA = getByTestId('container-a');
    const containerB = getByTestId('container-b');
    const container = signal<string | HTMLElement | null>(containerA);

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container,
      }),
    );

    await overlay.show();
    await waitFor(() => {
      expect(containerA.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });

    overlay.hide({ immediate: true });
    await waitFor(() => {
      expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    });

    container.set(containerB);

    await overlay.show();
    await waitFor(() => {
      expect(containerB.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });
  });

  it('should reattach a kept-mounted portal into the updated container on the next open', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const containerA = getByTestId('container-a');
    const containerB = getByTestId('container-b');
    const container = signal<string | HTMLElement | null>(containerA);

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container,
        keepMounted: signal(true),
      }),
    );

    await overlay.show();
    const rendered = await waitFor(() => {
      const el = containerA.querySelector('[data-testid="overlay"]');
      expect(el).toBeInTheDocument();
      return el;
    });

    overlay.hide({ immediate: true });
    await waitFor(() => {
      expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    });

    container.set(containerB);

    await overlay.show();
    await waitFor(() => {
      expect(containerB.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });

    // the same node was re-inserted, so the reattach branch (not a fresh attach) ran
    expect(containerB.querySelector('[data-testid="overlay"]')).toBe(rendered);
  });

  it('should keep an open overlay where it is when the container signal changes and use the new container on the next open', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const containerA = getByTestId('container-a');
    const containerB = getByTestId('container-b');
    const container = signal<string | HTMLElement | null>(containerA);

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container,
      }),
    );

    await overlay.show();
    await waitFor(() => {
      expect(containerA.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });

    container.set(containerB);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));

    expect(containerA.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    expect(containerB.querySelector('[data-testid="overlay"]')).toBeNull();

    overlay.hide({ immediate: true });
    await waitFor(() => {
      expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    });

    await overlay.show();
    await waitFor(() => {
      expect(containerB.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });
  });

  it('should attach to a static container given without a signal', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const containerA = getByTestId('container-a');

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container: containerA,
      }),
    );

    await overlay.show();
    await waitFor(() => {
      expect(containerA.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });
  });

  it('should fall back to document.body when the container signal resolves to null', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container: signal<string | HTMLElement | null>(null),
      }),
    );

    await overlay.show();
    await waitFor(() => {
      expect(screen.getByTestId('overlay').parentElement).toBe(document.body);
    });
  });

  it('should warn and fall back to document.body when the container selector matches nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content: host.content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container: signal<string | HTMLElement | null>('#does-not-exist'),
      }),
    );

    await overlay.show();
    await waitFor(() => {
      expect(screen.getByTestId('overlay').parentElement).toBe(document.body);
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('#does-not-exist'));
  });

  it('should keep a content swap in the container the overlay opened into, even after the container signal changed', async () => {
    const { fixture, getByTestId } = await render(OverlayContainerHostComponent);
    fixture.autoDetectChanges(true);

    const host = fixture.componentInstance;
    const containerA = getByTestId('container-a');
    const containerB = getByTestId('container-b');
    const container = signal<string | HTMLElement | null>(containerA);
    const content = signal<TemplateRef<NgpOverlayTemplateContext<unknown>> | undefined>(
      host.content(),
    );

    overlay = TestBed.runInInjectionContext(() =>
      createOverlay({
        content,
        triggerElement: getByTestId('trigger'),
        injector: host.injector,
        viewContainerRef: host.viewContainerRef,
        container,
      }),
    );

    await overlay.show();
    await waitFor(() => {
      expect(containerA.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });

    container.set(containerB);
    content.set(host.other());

    await waitFor(() => {
      expect(containerA.querySelector('[data-testid="other"]')).toBeInTheDocument();
    });
    expect(containerB.querySelector('[data-testid="other"]')).toBeNull();

    overlay.hide({ immediate: true });
    await waitFor(() => {
      expect(screen.queryByTestId('other')).not.toBeInTheDocument();
    });

    await overlay.show();
    await waitFor(() => {
      expect(containerB.querySelector('[data-testid="other"]')).toBeInTheDocument();
    });
  });
});
