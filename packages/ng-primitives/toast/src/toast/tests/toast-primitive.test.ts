import { signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpToast } from '../toast';
import { NgpToastManager } from '../toast-manager';
import { NgpToastOptions, provideToastOptions } from '../toast-options';

// Note: #762 (every `pointermove` while hovering scheduling a change detection
// pass) only manifests in a zone-based app. The fix binds the pointer listeners
// outside the Angular zone via the `listener()` helper. This test harness is
// zoneless, so that symptom cannot be reproduced here; these tests instead lock
// in that the listener-based wiring drives the swipe/attribute behaviour.

/**
 * Render a bare `[ngpToast]` directive with a set of options and a stubbed
 * manager. The real `NgpToastManager` only tracks toasts created through
 * `show()`; here we drive the directive directly, so we swap in a lightweight
 * stub whose `dismiss` we can assert against and whose `toasts` signal the
 * directive's computed state reads from.
 */
async function renderToast(overrides: Partial<NgpToastOptions> = {}) {
  // coalescing signal references (not their values) to provide a default signal
  // eslint-disable-next-line @angular-eslint/no-uncalled-signals
  const expanded = overrides.expanded ?? signal(false);
  const dismiss = vi.fn();
  const managerStub = {
    toasts: signal<{ instance: NgpToast }[]>([]),
    dismiss,
  };

  const options: NgpToastOptions = {
    placement: 'top-end',
    duration: 3000,
    register: () => {
      /* noop */
    },
    dismissible: true,
    swipeDirections: ['left', 'right', 'top', 'bottom'],
    sequential: false,
    // Keep the auto-dismiss timer inert unless a test opts in.
    persistent: true,
    ...overrides,
    expanded,
  };

  const view = await render(`<div ngpToast data-testid="toast"></div>`, {
    imports: [NgpToast],
    providers: [provideToastOptions(options), { provide: NgpToastManager, useValue: managerStub }],
  });

  const element = view.getByTestId('toast');
  return { ...view, element, dismiss, expanded, managerStub };
}

describe('NgpToast', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('roles & attributes', () => {
    it('reflects a top-end placement as data-position-x/y', async () => {
      const { element } = await renderToast({ placement: 'top-end' });
      expect(element).toHaveAttribute('data-position-x', 'end');
      expect(element).toHaveAttribute('data-position-y', 'top');
    });

    it('reflects a bottom-start placement as data-position-x/y', async () => {
      const { element } = await renderToast({ placement: 'bottom-start' });
      expect(element).toHaveAttribute('data-position-x', 'start');
      expect(element).toHaveAttribute('data-position-y', 'bottom');
    });

    it('reflects a center placement with a default x of end', async () => {
      const { element } = await renderToast({ placement: 'top-center' });
      expect(element).toHaveAttribute('data-position-x', 'center');
      expect(element).toHaveAttribute('data-position-y', 'top');
    });

    it('is visible by default', async () => {
      const { element } = await renderToast();
      expect(element).toHaveAttribute('data-visible', 'true');
    });

    it('is not swiping by default', async () => {
      const { element } = await renderToast();
      expect(element).toHaveAttribute('data-swiping', 'false');
    });

    it('reflects the expanded signal via data-expanded', async () => {
      const expanded = signal(false);
      const { element, fixture } = await renderToast({ expanded });
      expect(element).toHaveAttribute('data-expanded', 'false');

      expanded.set(true);
      // host bindings apply via afterRenderEffect; wait for it to flush
      await fixture.whenStable();
      expect(element).toHaveAttribute('data-expanded', 'true');
    });

    it('exposes the configured gap as a custom property', async () => {
      const { element } = await renderToast();
      expect(element.style.getPropertyValue('--ngp-toast-gap')).toBe('14px');
    });
  });

  describe('swipe to dismiss', () => {
    it('updates the swipe amount while dragging', async () => {
      const { element } = await renderToast();
      element.setPointerCapture = vi.fn();

      fireEvent(
        element,
        new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 }),
      );
      fireEvent(
        element,
        new PointerEvent('pointermove', { clientX: 40, clientY: 0, pointerId: 1 }),
      );

      expect(element).toHaveAttribute('data-swiping', 'true');
      expect(element.style.getPropertyValue('--ngp-toast-swipe-amount-x')).not.toBe('');
    });

    it('locks the swipe direction to the dominant axis', async () => {
      const { element } = await renderToast();
      element.setPointerCapture = vi.fn();

      fireEvent(
        element,
        new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 }),
      );
      fireEvent(
        element,
        new PointerEvent('pointermove', { clientX: 40, clientY: 5, pointerId: 1 }),
      );

      expect(element).toHaveAttribute('data-swipe-direction', 'right');
    });

    it('does not respond to pointermove before a pointerdown', async () => {
      const { element } = await renderToast();

      fireEvent(
        element,
        new PointerEvent('pointermove', { clientX: 40, clientY: 0, pointerId: 1 }),
      );

      expect(element).toHaveAttribute('data-swiping', 'false');
    });

    it('ignores right-click as a swipe start', async () => {
      const { element } = await renderToast();
      element.setPointerCapture = vi.fn();

      fireEvent(
        element,
        new PointerEvent('pointerdown', { button: 2, clientX: 0, clientY: 0, pointerId: 1 }),
      );
      fireEvent(
        element,
        new PointerEvent('pointermove', { clientX: 60, clientY: 0, pointerId: 1 }),
      );

      expect(element).toHaveAttribute('data-swiping', 'false');
    });

    it('does not swipe when the toast is not dismissible', async () => {
      const { element } = await renderToast({ dismissible: false });
      element.setPointerCapture = vi.fn();

      fireEvent(
        element,
        new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 }),
      );
      fireEvent(
        element,
        new PointerEvent('pointermove', { clientX: 60, clientY: 0, pointerId: 1 }),
      );

      expect(element).toHaveAttribute('data-swiping', 'false');
    });

    it('dismisses the toast once swiped past the threshold', async () => {
      const { element, dismiss, fixture } = await renderToast();
      element.setPointerCapture = vi.fn();

      fireEvent(
        element,
        new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 }),
      );
      fireEvent(
        element,
        new PointerEvent('pointermove', { clientX: 200, clientY: 0, pointerId: 1 }),
      );
      fireEvent(element, new PointerEvent('pointerup', { pointerId: 1 }));

      // dismissal is scheduled via afterNextRender; flush it
      await fixture.whenStable();
      expect(dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto-dismiss timer', () => {
    it('dismisses the toast after the duration elapses', async () => {
      const { dismiss } = await renderToast({ duration: 30, persistent: false });
      await waitFor(() => expect(dismiss).toHaveBeenCalledTimes(1));
    });

    it('does not auto-dismiss when persistent', async () => {
      const { dismiss } = await renderToast({ duration: 20, persistent: true });
      // give the timer well past the duration to prove it never fires
      await new Promise(resolve => setTimeout(resolve, 80));
      expect(dismiss).not.toHaveBeenCalled();
    });

    it('pauses the timer while expanded and resumes when collapsed', async () => {
      const expanded = signal(true);
      const { dismiss } = await renderToast({ duration: 30, persistent: false, expanded });

      // paused while expanded — should not fire even after the duration
      await new Promise(resolve => setTimeout(resolve, 80));
      expect(dismiss).not.toHaveBeenCalled();

      // collapsing resumes the timer
      expanded.set(false);
      await waitFor(() => expect(dismiss).toHaveBeenCalledTimes(1));
    });

    it('pauses the timer while the user is interacting via pointer', async () => {
      const { element, dismiss } = await renderToast({ duration: 40, persistent: false });
      element.setPointerCapture = vi.fn();

      // press and hold — interaction pauses the timer
      fireEvent(
        element,
        new PointerEvent('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 }),
      );

      await new Promise(resolve => setTimeout(resolve, 90));
      expect(dismiss).not.toHaveBeenCalled();

      // releasing resumes the timer
      fireEvent(element, new PointerEvent('pointerup', { pointerId: 1 }));
      await waitFor(() => expect(dismiss).toHaveBeenCalledTimes(1));
    });
  });
});
