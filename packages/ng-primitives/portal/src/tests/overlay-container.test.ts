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
import { afterEach, describe, expect, it } from 'vitest';
import { NgpOverlay, NgpOverlayTemplateContext, createOverlay } from '../overlay';

@Component({
  template: `
    <div id="container-a" data-testid="container-a"></div>
    <div id="container-b" data-testid="container-b"></div>
    <button data-testid="trigger" type="button">Trigger</button>

    <ng-template #content>
      <div data-testid="overlay">Overlay Content</div>
    </ng-template>
  `,
})
class OverlayContainerHostComponent {
  readonly content = viewChild.required<TemplateRef<NgpOverlayTemplateContext<unknown>>>('content');
  readonly viewContainerRef = inject(ViewContainerRef);
  readonly injector = inject(Injector);
}

describe('NgpOverlay container resolution', () => {
  let overlay: NgpOverlay<unknown> | null = null;

  afterEach(() => {
    overlay?.destroy();
    overlay = null;
    document.querySelectorAll('[data-testid="overlay"]').forEach(el => el.remove());
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
});
