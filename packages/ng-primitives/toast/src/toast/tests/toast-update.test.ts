import { Component, effect, inject, Injector, signal, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, waitFor } from '@testing-library/angular';
import {
  injectToastContext,
  injectToastContextSignal,
  NgpToast,
  NgpToastManager,
  NgpToastOptions,
  NgpToastRef,
  provideToastConfig,
} from 'ng-primitives/toast';
import { afterEach, describe, expect, it } from 'vitest';

interface ToastContext {
  label: string;
}

@Component({
  selector: 'test-toast',
  hostDirectives: [NgpToast],
  template: `
    <span class="label">{{ context().label }}</span>
    <span class="initial">{{ initial.label }}</span>
  `,
})
class TestToast {
  protected readonly context = injectToastContextSignal<ToastContext>();
  protected readonly initial = injectToastContext<ToastContext>();
}

@Component({
  template: `
    <ng-template #toast let-context="context">
      <div class="template-toast" ngpToast>{{ context.label }}</div>
    </ng-template>
  `,
  imports: [NgpToast],
})
class ToastHost {
  readonly manager = inject(NgpToastManager);
  readonly template = viewChild.required<TemplateRef<void>>('toast');
  readonly injector = inject(Injector);

  show(label: string, options: NgpToastOptions<ToastContext> = {}): NgpToastRef<ToastContext> {
    return this.manager.show(TestToast, { context: { label }, ...options });
  }

  showTemplate(label: string, options: NgpToastOptions<ToastContext> = {}) {
    return this.manager.show(this.template(), {
      context: { label },
      injector: this.injector,
      ...options,
    });
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
  const toast = toasts().find(t => t.querySelector('.label')?.textContent === label);
  expect(toast).toBeTruthy();
  return toast!;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Record the elements added to or removed from the toast containers. */
function watchContainers(): { changes: () => number; stop: () => void } {
  let changes = 0;
  const observer = new MutationObserver(records => {
    for (const record of records) {
      changes += [...record.addedNodes, ...record.removedNodes].filter(
        node => node.nodeType === Node.ELEMENT_NODE,
      ).length;
    }
  });
  containers().forEach(c => observer.observe(c, { childList: true, subtree: true }));
  return {
    changes: () => {
      observer.takeRecords();
      return changes;
    },
    stop: () => observer.disconnect(),
  };
}

afterEach(() => {
  // Toasts are portaled to document.body and outlive the fixture in browser mode.
  containers().forEach(c => c.remove());
});

describe('NgpToastRef.update()', () => {
  describe('content', () => {
    it('shows the new context in the same toast, without adding or removing elements', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('Uploading 1 of 3');

      const toast = await waitFor(() => toastWithLabel('Uploading 1 of 3'));
      const region = containers()[0];
      const watcher = watchContainers();

      ref.update({ context: { label: 'Uploading 2 of 3' } });

      await waitFor(() => expect(region.textContent).toContain('Uploading 2 of 3'));
      expect(toasts()).toEqual([toast]);
      expect(toast.querySelector('.label')).toHaveTextContent('Uploading 2 of 3');
      expect(watcher.changes()).toBe(0);
      watcher.stop();
    });

    it('updates a template toast that reads the context with let-context', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.showTemplate('Uploading 1 of 3');

      const toast = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('.template-toast');
        expect(element).toHaveTextContent('Uploading 1 of 3');
        return element!;
      });

      ref.update({ context: { label: 'Files uploaded' } });

      await waitFor(() => expect(toast).toHaveTextContent('Files uploaded'));
      expect(document.querySelectorAll('.template-toast')).toHaveLength(1);
    });

    it('keeps the value passed to show() in injectToastContext()', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('First');
      const toast = await waitFor(() => toastWithLabel('First'));

      ref.update({ context: { label: 'Second' } });

      await waitFor(() => expect(toast.querySelector('.label')).toHaveTextContent('Second'));
      expect(toast.querySelector('.initial')).toHaveTextContent('First');
    });

    it('keeps the context when an update passes none', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('Kept');
      const toast = await waitFor(() => toastWithLabel('Kept'));

      ref.update({ duration: 5000 });

      await waitFor(() =>
        expect(toast.style.getPropertyValue('--ngp-toast-duration')).toBe('5000ms'),
      );
      expect(toast.querySelector('.label')).toHaveTextContent('Kept');
    });
  });

  describe('position and animation', () => {
    it('keeps the toast at its place in the pile', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('Back');
      host.show('Front');

      await waitFor(() => expect(toasts()).toHaveLength(2));
      const back = toastWithLabel('Back');
      expect(back.style.getPropertyValue('--ngp-toasts-before')).toBe('1');

      ref.update({ context: { label: 'Back, updated' } });

      await waitFor(() => expect(back.querySelector('.label')).toHaveTextContent('Back, updated'));
      expect(back.style.getPropertyValue('--ngp-toasts-before')).toBe('1');
      expect(toastWithLabel('Front').style.getPropertyValue('--ngp-toasts-before')).toBe('0');
    });

    it('does not replay the enter animation', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('A');
      const toast = await waitFor(() => {
        expect(toastWithLabel('A')).toHaveAttribute('data-enter');
        return toastWithLabel('A');
      });
      const watcher = watchContainers();

      ref.update({ context: { label: 'B' } });

      await waitFor(() => expect(toast.querySelector('.label')).toHaveTextContent('B'));
      expect(toast).toHaveAttribute('data-enter');
      expect(toast.isConnected).toBe(true);
      expect(watcher.changes()).toBe(0);
      watcher.stop();
    });
  });

  describe('timer', () => {
    it('restarts the timer when only the context changes', async () => {
      const host = await renderHost({ duration: 300 });
      const ref = host.show('A');
      await waitFor(() => expect(toasts()).toHaveLength(1));

      await wait(200);
      ref.update({ context: { label: 'B' } });

      // The first run would have ended 300 ms after show(), about 100 ms from now.
      await wait(200);
      expect(toasts()).toHaveLength(1);

      await waitFor(() => expect(toasts()).toHaveLength(0));
    });

    it('restarts the timer with the new duration', async () => {
      const host = await renderHost({ duration: 60_000 });
      const ref = host.show('A');
      const toast = await waitFor(() => toastWithLabel('A'));

      ref.update({ duration: 50 });

      await waitFor(() =>
        expect(toast.style.getPropertyValue('--ngp-toast-duration')).toBe('50ms'),
      );
      await waitFor(() => expect(toasts()).toHaveLength(0));
    });

    it('stops the timer when the toast becomes persistent, and starts it when it stops being', async () => {
      const host = await renderHost({ duration: 100 });
      const ref = host.show('A');
      const toast = await waitFor(() => toastWithLabel('A'));

      ref.update({ persistent: true });

      await waitFor(() => expect(toast).toHaveAttribute('data-paused'));
      await wait(300);
      expect(toasts()).toHaveLength(1);

      ref.update({ persistent: false, duration: 50 });

      await waitFor(() => expect(toasts()).toHaveLength(0));
    });

    it('stays paused while hovered, then runs the new duration in full', async () => {
      const host = await renderHost({ duration: 60_000 });
      const ref = host.show('A');
      const toast = await waitFor(() => toastWithLabel('A'));
      const container = containers()[0];

      container.dispatchEvent(new MouseEvent('mouseenter'));
      await waitFor(() => expect(toast).toHaveAttribute('data-paused'));

      ref.update({ duration: 50 });
      await wait(250);
      expect(toasts()).toHaveLength(1);
      expect(toast).toHaveAttribute('data-paused');

      container.dispatchEvent(new MouseEvent('mouseleave'));
      await waitFor(() => expect(toasts()).toHaveLength(0));
    });

    it('keeps a toast behind the front one paused with sequential', async () => {
      const host = await renderHost({ duration: 60_000, sequential: true });
      const ref = host.show('Back');
      const front = host.show('Front');
      await waitFor(() => expect(toasts()).toHaveLength(2));
      const back = toastWithLabel('Back');

      ref.update({ duration: 50 });
      await wait(250);
      expect(back).toHaveAttribute('data-paused');
      expect(back.isConnected).toBe(true);

      await front.dismiss();
      await waitFor(() => expect(back.isConnected).toBe(false));
    });

    it('counts each restart in restarts()', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('A');
      await waitFor(() => expect(toasts()).toHaveLength(1));
      const manager = host.manager;
      const instance = manager.toasts()[0].instance;

      expect(instance.restarts()).toBe(0);
      ref.update({ context: { label: 'B' } });
      ref.update({ duration: 1000 });
      expect(instance.restarts()).toBe(2);
    });
  });

  describe('inside an effect', () => {
    it('does not make an effect that calls update() follow the toasts', async () => {
      const host = await renderHost({ persistent: true });
      const ref = host.show('Progress 0');
      await waitFor(() => expect(toasts()).toHaveLength(1));
      const instance = host.manager.toasts()[0].instance;

      const progress = signal(1);
      let runs = 0;
      effect(
        () => {
          runs++;
          ref.update({ context: { label: `Progress ${progress()}` } });
        },
        { injector: host.injector },
      );
      TestBed.tick();
      expect(runs).toBe(1);

      host.show('Another toast');
      await waitFor(() => expect(toasts()).toHaveLength(2));
      TestBed.tick();

      expect(runs).toBe(1);
      expect(instance.restarts()).toBe(1);

      progress.set(2);
      TestBed.tick();
      expect(runs).toBe(2);
      await waitFor(() => expect(toastWithLabel('Progress 2')).toBeTruthy());
    });

    it('does not make an effect that calls show() follow the context of the toast', async () => {
      const host = await renderHost({ persistent: true });
      let ref: NgpToastRef<ToastContext> | undefined;
      let runs = 0;
      effect(
        () => {
          runs++;
          ref = host.show('First');
        },
        { injector: host.injector },
      );
      TestBed.tick();
      await waitFor(() => expect(toasts()).toHaveLength(1));

      ref!.update({ context: { label: 'Second' } });
      TestBed.tick();

      await waitFor(() => expect(toastWithLabel('Second')).toBeTruthy());
      expect(runs).toBe(1);
      expect(toasts()).toHaveLength(1);
    });
  });

  it('does nothing once the toast is being dismissed', async () => {
    const host = await renderHost({ persistent: true });
    const ref = host.show('A');
    const toast = await waitFor(() => toastWithLabel('A'));
    const instance = host.manager.toasts()[0].instance;

    const dismissed = ref.dismiss();
    ref.update({ context: { label: 'B' }, persistent: false, duration: 1 });

    expect(instance.restarts()).toBe(0);
    await dismissed;
    expect(toast.isConnected).toBe(false);
    expect(() => ref.update({ context: { label: 'C' } })).not.toThrow();
  });
});
