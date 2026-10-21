import { Component, inject } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectToastContext,
  NgpToast,
  NgpToastManager,
  NgpToastOptions,
  provideToastConfig,
} from 'ng-primitives/toast';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface ToastContext {
  label: string;
}

@Component({
  selector: 'test-toast',
  hostDirectives: [NgpToast],
  template: `
    <span>{{ context.label }}</span>
    <button class="dismiss" (click)="dismiss()">Dismiss</button>
  `,
  styles: `
    :host {
      display: block;
      height: 40px;
    }
  `,
})
class TestToast {
  private readonly manager = inject(NgpToastManager);
  private readonly toast = inject(NgpToast);
  protected readonly context = injectToastContext<ToastContext>();

  dismiss(): void {
    this.manager.dismiss(this.toast);
  }
}

@Component({
  selector: 'test-toast-host',
  template: ``,
})
class ToastHost {
  readonly manager = inject(NgpToastManager);

  show(label: string, options: NgpToastOptions = {}) {
    return this.manager.show(TestToast, { context: { label }, ...options });
  }
}

async function renderHost(config: Parameters<typeof provideToastConfig>[0] = {}) {
  const view = await render(ToastHost, { providers: [provideToastConfig(config)] });
  return view.fixture.componentInstance;
}

function containers(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-ngp-toast-container]'));
}

function toasts(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('test-toast'));
}

function toastWithLabel(label: string): HTMLElement {
  const toast = toasts().find(t => t.textContent?.includes(label));
  expect(toast).toBeTruthy();
  return toast!;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

afterEach(() => {
  // Toasts are portaled to document.body and outlive the fixture in browser mode.
  containers().forEach(c => c.remove());
  vi.restoreAllMocks();
});

describe('NgpToastManager behaviour', () => {
  describe('config providers', () => {
    it('uses the configured placement when show() does not specify one', async () => {
      const host = await renderHost({ placement: 'bottom-center', persistent: true });
      host.show('A');

      await waitFor(() => {
        const container = document.querySelector('[data-ngp-toast-container="bottom-center"]');
        expect(container).toBeTruthy();
        const toast = container!.querySelector('test-toast');
        expect(toast).toHaveAttribute('data-position-x', 'center');
        expect(toast).toHaveAttribute('data-position-y', 'bottom');
      });
    });

    it('positions the container from the configured offsets and exposes the configured gap', async () => {
      const host = await renderHost({
        placement: 'top-end',
        offsetTop: 16,
        offsetRight: 20,
        gap: 12,
        persistent: true,
      });
      host.show('A');

      await waitFor(() => expect(toasts().length).toBe(1));
      const container = containers()[0];
      expect(container.style.top).toBe('16px');
      expect(container.style.right).toBe('20px');
      expect(container.style.getPropertyValue('--ngp-toast-gap')).toBe('12px');
      expect(toasts()[0].style.getPropertyValue('--ngp-toast-gap')).toBe('12px');
    });
  });

  describe('auto-dismiss', () => {
    it('removes the toast after the configured duration', async () => {
      const host = await renderHost({ duration: 50 });
      host.show('A');

      await waitFor(() => expect(toasts().length).toBe(1));
      await waitFor(() => expect(toasts().length).toBe(0));
    });

    it('lets a per-call duration override the configured duration', async () => {
      const host = await renderHost({ duration: 60_000 });
      host.show('A', { duration: 50 });

      await waitFor(() => expect(toasts().length).toBe(1));
      await waitFor(() => expect(toasts().length).toBe(0));
    });

    it('does not auto-dismiss while the container is hovered and resumes on leave', async () => {
      const host = await renderHost({ duration: 60 });
      host.show('A');

      await waitFor(() => expect(toasts().length).toBe(1));
      const container = containers()[0];
      container.dispatchEvent(new MouseEvent('mouseenter'));
      await waitFor(() => expect(toasts()[0]).toHaveAttribute('data-paused'));

      await wait(200);
      expect(toasts().length).toBe(1);

      container.dispatchEvent(new MouseEvent('mouseleave'));
      await waitFor(() => expect(toasts().length).toBe(0));
    });
  });

  describe('stacking', () => {
    it('marks toasts beyond maxToasts as not visible', async () => {
      const host = await renderHost({ maxToasts: 2, persistent: true });
      host.show('First');
      host.show('Second');
      host.show('Third');

      await waitFor(() => {
        expect(toasts().length).toBe(3);
        expect(toastWithLabel('Third')).toHaveAttribute('data-visible', 'true');
        expect(toastWithLabel('Second')).toHaveAttribute('data-visible', 'true');
        expect(toastWithLabel('First')).toHaveAttribute('data-visible', 'false');
      });
    });

    it('exposes the stack index, offset and front toast height as custom properties', async () => {
      const host = await renderHost({ gap: 10, persistent: true });
      host.show('Back');
      host.show('Front');

      await waitFor(() => {
        const front = toastWithLabel('Front');
        const back = toastWithLabel('Back');
        expect(front.style.getPropertyValue('--ngp-toasts-before')).toBe('0');
        expect(back.style.getPropertyValue('--ngp-toasts-before')).toBe('1');
        expect(front.style.getPropertyValue('--ngp-toast-offset')).toBe('0px');
        expect(back.style.getPropertyValue('--ngp-toast-offset')).toBe('50px');
        expect(front.style.getPropertyValue('--ngp-toast-front-height')).toBe('40px');
        expect(back.style.getPropertyValue('--ngp-toast-front-height')).toBe('40px');
      });
    });

    it('collapses the placement once its last toast is dismissed while hovered', async () => {
      const host = await renderHost({ persistent: true });
      host.show('A');

      await waitFor(() => expect(toasts().length).toBe(1));
      containers()[0].dispatchEvent(new MouseEvent('mouseenter'));
      await waitFor(() => expect(toasts()[0]).toHaveAttribute('data-expanded', 'true'));

      toasts()[0].querySelector<HTMLButtonElement>('.dismiss')!.click();
      await waitFor(() => expect(toasts().length).toBe(0));

      host.show('B');
      await waitFor(() => expect(toastWithLabel('B')).toHaveAttribute('data-expanded', 'false'));
    });
  });

  describe('enter and exit animation', () => {
    it('marks a shown toast with data-enter', async () => {
      const host = await renderHost({ persistent: true });
      host.show('A');

      await waitFor(() => expect(toasts()[0]).toHaveAttribute('data-enter'));
    });

    it('keeps the toast mounted with data-exit until its exit animation ends, then resolves dismiss', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('A');

      const toast = await waitFor(() => {
        expect(toasts()[0]).toHaveAttribute('data-enter');
        return toasts()[0];
      });

      // The global test setup zeroes animation durations, so stand in a pending animation.
      let finishAnimation!: () => void;
      const finished = new Promise<void>(resolve => (finishAnimation = resolve));
      toast.getAnimations = () => [
        {
          finished,
          cancel: () => undefined,
          effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
        } as unknown as Animation,
      ];

      let resolved = false;
      const dismissed = ref.dismiss().then(() => (resolved = true));

      try {
        await waitFor(() => expect(toast).toHaveAttribute('data-exit'));
        expect(toast).not.toHaveAttribute('data-enter');
        await wait(20);
        expect(toast.isConnected).toBe(true);
        expect(resolved).toBe(false);
      } finally {
        finishAnimation();
      }
      await dismissed;
      expect(toast.isConnected).toBe(false);
    });
  });

  describe('swipe', () => {
    function startSwipe(target: HTMLElement, toX: number) {
      target.setPointerCapture = vi.fn();
      fireEvent(
        target,
        new PointerEvent('pointerdown', {
          button: 0,
          clientX: 0,
          clientY: 0,
          pointerId: 1,
          bubbles: true,
        }),
      );
      fireEvent(
        target,
        new PointerEvent('pointermove', { clientX: toX, clientY: 0, pointerId: 1, bubbles: true }),
      );
    }

    it('exposes the raw swipe distance and direction while swiping left', async () => {
      const host = await renderHost({ persistent: true });
      host.show('A');

      await waitFor(() => expect(toasts().length).toBe(1));
      const toast = toasts()[0];
      startSwipe(toast, -30);

      await waitFor(() => {
        expect(toast).toHaveAttribute('data-swiping', 'true');
        expect(toast).toHaveAttribute('data-swipe-direction', 'left');
        expect(toast.style.getPropertyValue('--ngp-toast-swipe-x')).toBe('-30');
      });
    });

    it('disables swiping when show() passes dismissible: false', async () => {
      const host = await renderHost({ dismissible: true, persistent: true });
      host.show('A', { dismissible: false });

      await waitFor(() => expect(toasts().length).toBe(1));
      const toast = toasts()[0];
      startSwipe(toast, 60);

      await wait(50);
      expect(toast).toHaveAttribute('data-swiping', 'false');
    });

    it('does not start a swipe when the pointer goes down on an interactive child', async () => {
      const host = await renderHost({ persistent: true });
      host.show('A');

      await waitFor(() => expect(toasts().length).toBe(1));
      const toast = toasts()[0];
      startSwipe(toast.querySelector<HTMLButtonElement>('.dismiss')!, 60);

      await wait(50);
      expect(toast).toHaveAttribute('data-swiping', 'false');
    });
  });
});
