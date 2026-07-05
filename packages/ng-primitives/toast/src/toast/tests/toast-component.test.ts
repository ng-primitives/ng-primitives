import { Component, inject } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import {
  injectToastContext,
  NgpToast,
  NgpToastManager,
  provideToastConfig,
} from 'ng-primitives/toast';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring the reusable component at
 * `apps/components/src/app/pages/reusable-components/toast`. A toast is a
 * component that composes the `NgpToast` directive via `hostDirectives`, reads
 * its context, and dismisses itself through the manager. It is never placed in
 * a template directly — the `NgpToastManager` renders it into a placement
 * container appended to `document.body`.
 */
interface ToastContext {
  header: string;
  description: string;
}

@Component({
  selector: 'app-toast',
  imports: [NgpButton],
  hostDirectives: [NgpToast],
  template: `
    <p class="toast-title">{{ context.header }}</p>
    <p class="toast-description">{{ context.description }}</p>
    <button class="toast-dismiss" (click)="dismiss()" ngpButton>Dismiss</button>
  `,
})
class Toast {
  private readonly toastManager = inject(NgpToastManager);
  private readonly toast = inject(NgpToast);
  protected readonly context = injectToastContext<ToastContext>();

  dismiss(): void {
    this.toastManager.dismiss(this.toast);
  }
}

@Component({
  selector: 'app-toast-host',
  template: `
    <button>Show Toast</button>
  `,
})
class ToastHost {
  private readonly toastManager = inject(NgpToastManager);

  show(context: ToastContext, options: Record<string, unknown> = {}) {
    return this.toastManager.show(Toast, { context, persistent: true, ...options });
  }
}

function containers(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-ngp-toast-container]'));
}

async function renderHost(config: Parameters<typeof provideToastConfig>[0] = {}) {
  const view = await render(ToastHost, { providers: [provideToastConfig(config)] });
  const host = view.fixture.componentInstance;
  return { ...view, host };
}

afterEach(() => {
  // Toasts are portaled to document.body and outlive the fixture in browser mode.
  containers().forEach(c => c.remove());
});

describe('Toast (reusable component)', () => {
  describe('rendering', () => {
    it('renders the toast content into a placement container', async () => {
      const { host } = await renderHost();
      host.show({ header: 'Saved', description: 'Your changes were saved.' });

      await waitFor(() => {
        const container = containers()[0];
        expect(container).toBeTruthy();
        expect(container.textContent).toContain('Saved');
        expect(container.textContent).toContain('Your changes were saved.');
      });
    });

    it('applies the placement to the container data attribute and the toast position attributes', async () => {
      const { host } = await renderHost();
      host.show({ header: 'A', description: 'B' }, { placement: 'bottom-start' });

      await waitFor(() => {
        const container = document.querySelector('[data-ngp-toast-container="bottom-start"]');
        expect(container).toBeTruthy();
        const toast = container?.querySelector('app-toast') as HTMLElement;
        expect(toast).toHaveAttribute('data-position-x', 'start');
        expect(toast).toHaveAttribute('data-position-y', 'bottom');
      });
    });
  });

  describe('live region (ARIA)', () => {
    it('exposes the container as a polite live region by default', async () => {
      const { host } = await renderHost();
      host.show({ header: 'A', description: 'B' });

      await waitFor(() => {
        const container = containers()[0];
        expect(container).toBeTruthy();
        expect(container).toHaveAttribute('aria-live', 'polite');
        expect(container).toHaveAttribute('aria-atomic', 'false');
        // The container is programmatically focusable but out of the tab order.
        expect(container).toHaveAttribute('tabindex', '-1');
      });
    });

    it('honours an assertive aria-live configuration and pairs it with role="alert"', async () => {
      const { host } = await renderHost({ ariaLive: 'assertive' });
      host.show({ header: 'A', description: 'B' });

      await waitFor(() => {
        const container = containers()[0];
        expect(container).toBeTruthy();
        expect(container).toHaveAttribute('aria-live', 'assertive');
        expect(container).toHaveAttribute('role', 'alert');
      });
    });

    it('pairs a polite live region with role="status"', async () => {
      const { host } = await renderHost();
      host.show({ header: 'A', description: 'B' });

      await waitFor(() => {
        const container = containers()[0];
        expect(container).toBeTruthy();
        expect(container).toHaveAttribute('aria-live', 'polite');
        expect(container).toHaveAttribute('role', 'status');
      });
    });
  });

  describe('stacking', () => {
    it('marks the most recent toast as the front toast', async () => {
      const { host } = await renderHost();
      host.show({ header: 'First', description: '1' });
      await waitFor(() => expect(containers()[0]?.querySelectorAll('app-toast').length).toBe(1));

      host.show({ header: 'Second', description: '2' });
      await waitFor(() => {
        const toasts = containers()[0].querySelectorAll<HTMLElement>('app-toast');
        expect(toasts.length).toBe(2);
      });

      // The newest toast is unshifted to the front of the list (index 0).
      const toasts = Array.from(containers()[0].querySelectorAll<HTMLElement>('app-toast'));
      const front = toasts.find(t => t.textContent?.includes('Second'));
      const back = toasts.find(t => t.textContent?.includes('First'));
      expect(front).toHaveAttribute('data-front', 'true');
      expect(back).toHaveAttribute('data-front', 'false');
    });
  });

  describe('dismiss', () => {
    it('removes the toast from the live region when dismissed via its button', async () => {
      const { host } = await renderHost();
      host.show({ header: 'Dismiss me', description: 'B' });

      const dismissButton = await waitFor(() => {
        const button = containers()[0]?.querySelector<HTMLButtonElement>('.toast-dismiss');
        expect(button).toBeTruthy();
        return button!;
      });

      dismissButton.click();

      await waitFor(() => {
        expect(containers()[0]?.querySelector('app-toast')).toBeNull();
      });
    });

    it('removes the toast from the live region when dismissed via the manager ref', async () => {
      const { host } = await renderHost();
      const ref = host.show({ header: 'Ref dismiss', description: 'B' });

      await waitFor(() => expect(containers()[0]?.querySelector('app-toast')).toBeTruthy());

      await ref.dismiss();

      await waitFor(() => {
        expect(containers()[0]?.querySelector('app-toast')).toBeNull();
      });
    });
  });

  describe('pause on hover', () => {
    it('expands the toast (pausing its timer) while the container is hovered', async () => {
      const { host } = await renderHost();
      host.show({ header: 'Hover me', description: 'B' });

      const container = await waitFor(() => {
        const c = containers()[0];
        expect(c?.querySelector('app-toast')).toBeTruthy();
        return c;
      });

      const toast = container.querySelector('app-toast') as HTMLElement;
      expect(toast).toHaveAttribute('data-expanded', 'false');

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await waitFor(() => expect(toast).toHaveAttribute('data-expanded', 'true'));

      container.dispatchEvent(new MouseEvent('mouseleave'));
      await waitFor(() => expect(toast).toHaveAttribute('data-expanded', 'false'));
    });
  });
});
