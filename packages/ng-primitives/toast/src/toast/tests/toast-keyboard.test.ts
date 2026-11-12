import {
  Component,
  inject,
  Injector,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpDialog, NgpDialogManager, NgpDialogOverlay } from 'ng-primitives/dialog';
import { NgpToast, NgpToastManager, NgpToastPlacement, NgpToastRef } from 'ng-primitives/toast';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  selector: 'test-keyboard-toast',
  hostDirectives: [NgpToast],
  template: `
    <button data-testid="toast-action">Undo</button>
  `,
})
class TestToast {}

@Component({
  template: `
    <button data-testid="page-button">Page</button>
    <button data-testid="other-button">Other</button>

    <ng-template #animatedToast>
      <div ngpToast animate.leave="toast-leave">
        <button data-testid="animated-toast-action">Undo</button>
      </div>
    </ng-template>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button data-testid="dialog-button">Inside</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    /* !important beats the test setup, which sets every animation to 0s */
    .toast-leave {
      animation: toast-leave 150ms !important;
    }

    @keyframes toast-leave {
      to {
        opacity: 0;
      }
    }
  `,
  imports: [NgpDialog, NgpDialogOverlay, NgpToast],
})
class ToastKeyboardHost {
  readonly toasts = inject(NgpToastManager);
  readonly dialogs = inject(NgpDialogManager);
  readonly dialog = viewChild.required<TemplateRef<unknown>>('dialog');
  readonly animatedToast = viewChild.required<TemplateRef<void>>('animatedToast');
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  showToast(placement?: NgpToastPlacement): NgpToastRef {
    return this.toasts.show(TestToast, { persistent: true, placement });
  }

  showAnimatedToast(): NgpToastRef {
    return this.toasts.show(this.animatedToast(), { persistent: true, injector: this.injector });
  }

  openDialog(): void {
    this.dialogs.open(this.dialog(), { viewContainerRef: this.viewContainerRef });
  }
}

function container(placement?: NgpToastPlacement): HTMLElement {
  const selector = placement
    ? `[data-ngp-toast-container="${placement}"]`
    : '[data-ngp-toast-container]';
  const element = document.querySelector<HTMLElement>(selector);
  expect(element).toBeTruthy();
  return element!;
}

function actions(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-testid="toast-action"]'));
}

function pressKey(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const target = document.activeElement ?? document.body;
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function renderHost({ animationsEnabled = false } = {}) {
  const view = await render(ToastKeyboardHost, {
    configureTestBed: testBed => testBed.configureTestingModule({ animationsEnabled }),
  });
  return { host: view.fixture.componentInstance, getByTestId: view.getByTestId };
}

afterEach(async () => {
  // Toasts are portaled to document.body and outlive the fixture in browser mode.
  document.querySelectorAll('[data-ngp-toast-container]').forEach(c => c.remove());
  // The pointer keeps its position across test files: park it where nothing renders, so a
  // later file's toast container does not appear under it and pause its auto-dismiss.
  const corner = document.body.appendChild(document.createElement('div'));
  corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
  await userEvent.hover(corner);
  corner.remove();
});

describe('NgpToastManager keyboard access', () => {
  it('moves focus to the toasts on F6 and back on F6 again', async () => {
    const { host, getByTestId } = await renderHost();
    host.showToast();
    const pageButton = getByTestId('page-button');
    pageButton.focus();

    const event = pressKey('F6');

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(container());

    pressKey('F6');

    expect(document.activeElement).toBe(pageButton);
  });

  it('does nothing on F6 once every toast is dismissed', async () => {
    const { host, getByTestId } = await renderHost();
    // showing a toast registers the key listeners; dismissing it leaves an empty container
    await host.showToast().dismiss();
    const pageButton = getByTestId('page-button');
    pageButton.focus();

    const event = pressKey('F6');

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(pageButton);
  });

  it('lets F6 through when the toasts were reached with Tab', async () => {
    const { host } = await renderHost();
    host.showToast();
    const action = document.querySelector<HTMLElement>('[data-testid="toast-action"]')!;
    action.focus();

    const event = pressKey('F6');

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(action);
  });

  it('forgets the saved element once focus leaves the toasts another way', async () => {
    const { host, getByTestId } = await renderHost();
    host.showToast();
    const pageButton = getByTestId('page-button');
    pageButton.focus();
    pressKey('F6');
    expect(document.activeElement).toBe(container());

    getByTestId('other-button').focus();
    const action = document.querySelector<HTMLElement>('[data-testid="toast-action"]')!;
    action.focus();

    const event = pressKey('Escape');

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(action);
  });

  describe('when nothing had focus before F6', () => {
    async function f6FromNothing() {
      const view = await renderHost();
      const toast = view.host.showToast();
      (document.activeElement as HTMLElement | null)?.blur();
      pressKey('F6');
      expect(document.activeElement).toBe(container());
      return toast;
    }

    it('leaves the toasts on F6 again', async () => {
      await f6FromNothing();

      pressKey('F6');

      expect(document.activeElement).toBe(document.body);
    });

    it('leaves the toasts on Escape', async () => {
      await f6FromNothing();

      pressKey('Escape');

      expect(document.activeElement).toBe(document.body);
    });

    it('leaves the toasts when the last toast leaves the focused region', async () => {
      const toast = await f6FromNothing();

      await toast.dismiss();

      expect(document.activeElement).toBe(document.body);
    });
  });

  it('forgets where a clicked toast was entered from once focus leaves the toasts', async () => {
    const { host, getByTestId } = await renderHost();
    getByTestId('page-button').focus();
    const toast = host.showToast();
    // a click focuses the action, as Chrome does, without F6
    const action = document.querySelector<HTMLElement>('[data-testid="toast-action"]')!;
    action.focus();
    getByTestId('other-button').focus();
    // come back from nothing focused, so there is no new element to record
    (document.activeElement as HTMLElement).blur();
    action.focus();

    await toast.dismiss();

    expect(document.activeElement).toBe(document.body);
  });

  it('forgets the saved element when focus moves to the page while the window is in the background', async () => {
    const { host, getByTestId } = await renderHost();
    host.showToast();
    getByTestId('page-button').focus();
    pressKey('F6');
    expect(document.activeElement).toBe(container());

    const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    getByTestId('other-button').focus();
    hasFocus.mockRestore();
    (document.activeElement as HTMLElement).blur();
    pressKey('F6');
    expect(document.activeElement).toBe(container());

    pressKey('F6');

    // back to nothing focused, not to the page button saved before
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps the saved element when the window loses focus', async () => {
    const { host, getByTestId } = await renderHost();
    host.showToast();
    const pageButton = getByTestId('page-button');
    pageButton.focus();
    pressKey('F6');
    expect(document.activeElement).toBe(container());

    // switching to another window blurs the toasts with no related target
    const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    container().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    hasFocus.mockRestore();
    // coming back, focus re-enters the toasts with no related target either
    container().dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: null }));

    pressKey('Escape');

    expect(document.activeElement).toBe(pageButton);
  });

  describe('when the focused toast is dismissed', () => {
    async function dismissFocusedToast() {
      const view = await renderHost();
      const first = view.host.showToast();
      const pageButton = view.getByTestId('page-button');
      pageButton.focus();
      pressKey('F6');
      document.querySelector<HTMLElement>('[data-testid="toast-action"]')!.focus();

      await first.dismiss();
      return { ...view, pageButton };
    }

    async function expectSavedElementForgotten(host: ToastKeyboardHost) {
      host.showToast();
      const action = document.querySelector<HTMLElement>('[data-testid="toast-action"]')!;
      action.focus();

      const event = pressKey('Escape');

      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(action);
    }

    it('returns focus to where F6 came from', async () => {
      const { host, pageButton } = await dismissFocusedToast();

      expect(document.activeElement).toBe(pageButton);
      await expectSavedElementForgotten(host);
    });

    it('returns focus even where removing an element fires no focusout', async () => {
      // Safari and Firefox do not dispatch focusout for a focused element that is removed
      const swallow = (event: Event) => event.stopPropagation();
      window.addEventListener('focusout', swallow, { capture: true });

      try {
        const { host, pageButton } = await dismissFocusedToast();

        expect(document.activeElement).toBe(pageButton);
        await expectSavedElementForgotten(host);
      } finally {
        window.removeEventListener('focusout', swallow, { capture: true });
      }
    });
  });

  it('closes a toast when no element is active', async () => {
    const { host, getByTestId } = await renderHost();
    const toast = host.showToast();
    const pageButton = getByTestId('page-button');
    pageButton.focus();
    // `activeElement` is null in a document without a body.
    const activeElement = vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null);

    try {
      await toast.dismiss();
    } finally {
      activeElement.mockRestore();
    }

    expect(actions()).toHaveLength(0);
    expect(document.activeElement).toBe(pageButton);
  });

  describe('when a toast reached with Tab closes', () => {
    async function showTwoToasts({ animationsEnabled = false } = {}) {
      const view = await renderHost({ animationsEnabled });
      const older = view.host.showToast();
      const newer = view.host.showToast();
      const [olderAction, newerAction] = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid="toast-action"]'),
      );
      const toastOf = (action: HTMLElement) => action.closest<HTMLElement>('test-keyboard-toast')!;
      return { ...view, older, newer, olderAction, newerAction, toastOf };
    }

    it('moves focus to the next older toast', async () => {
      const { newer, olderAction, newerAction, toastOf, getByTestId } = await showTwoToasts();
      getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}');
      expect(document.activeElement).toBe(newerAction);

      await newer.dismiss();

      expect(document.activeElement).toBe(toastOf(olderAction));
    });

    it('moves focus to the newer toast when the oldest closes', async () => {
      const { older, olderAction, newerAction, toastOf, getByTestId } = await showTwoToasts();
      getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(olderAction);

      await older.dismiss();

      expect(document.activeElement).toBe(toastOf(newerAction));
    });

    it('returns focus to where Tab came from once no toast is left', async () => {
      const { older, newer, getByTestId } = await showTwoToasts();
      const otherButton = getByTestId('other-button');
      otherButton.focus();
      await userEvent.keyboard('{Tab}{Tab}');

      await newer.dismiss();
      await older.dismiss();

      expect(document.activeElement).toBe(otherButton);
    });

    it('keeps F6 and Escape to an F6 round trip after moving to the next toast', async () => {
      const { newer, olderAction, toastOf, getByTestId } = await showTwoToasts();
      getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}');
      await newer.dismiss();

      expect(pressKey('Escape').defaultPrevented).toBe(false);
      expect(pressKey('F6').defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(toastOf(olderAction));
    });

    it('moves focus from a toast in the middle to the next older one', async () => {
      const view = await renderHost();
      view.host.showToast();
      const middle = view.host.showToast();
      view.host.showToast();
      const [oldestAction] = actions();
      view.getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}');
      expect(document.activeElement).toBe(actions()[1]);

      await middle.dismiss();

      expect(document.activeElement).toBe(oldestAction.closest('test-keyboard-toast'));
    });

    it('skips a neighbour that is closing at the same time', async () => {
      const view = await renderHost();
      view.host.showToast();
      const middle = view.host.showToast();
      const newest = view.host.showToast();
      const [oldestAction] = actions();
      view.getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}{Tab}');

      await Promise.all([middle.dismiss(), newest.dismiss()]);

      expect(document.activeElement).toBe(oldestAction.closest('test-keyboard-toast'));
    });

    it('does not move focus to a toast at another placement', async () => {
      const view = await renderHost();
      view.host.showToast('top-start');
      const toast = view.host.showToast('bottom-end');
      const otherButton = view.getByTestId('other-button');
      otherButton.focus();
      await userEvent.keyboard('{Tab}{Tab}');
      expect(container('bottom-end').contains(document.activeElement)).toBe(true);

      await toast.dismiss();

      expect(document.activeElement).toBe(otherButton);
    });

    it('keeps the tabindex while the window, not the page, takes focus away', async () => {
      const { newer, olderAction, toastOf, getByTestId } = await showTwoToasts();
      getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}');
      await newer.dismiss();

      // switching window or tab blurs the active element without changing it
      toastOf(olderAction).dispatchEvent(new FocusEvent('blur'));

      expect(toastOf(olderAction)).toHaveAttribute('tabindex', '-1');
    });

    it('takes back the tabindex it gave a toast once that toast loses focus', async () => {
      const { newer, olderAction, toastOf, getByTestId } = await showTwoToasts();
      getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}');
      await newer.dismiss();
      expect(toastOf(olderAction)).toHaveAttribute('tabindex', '-1');

      getByTestId('page-button').focus();

      expect(toastOf(olderAction)).not.toHaveAttribute('tabindex');
    });

    it('moves focus on as the toast starts to close, before an animate.leave removes it', async () => {
      const { host, newerAction, toastOf, getByTestId } = await showTwoToasts({
        animationsEnabled: true,
      });
      const animated = host.showAnimatedToast();
      const animatedAction = document.querySelector<HTMLElement>(
        '[data-testid="animated-toast-action"]',
      )!;
      getByTestId('other-button').focus();
      await userEvent.keyboard('{Tab}{Tab}{Tab}');
      expect(document.activeElement).toBe(animatedAction);

      await animated.dismiss();

      // Angular keeps the element for its leave animation after the view is destroyed
      expect(animatedAction.isConnected).toBe(true);
      expect(document.activeElement).toBe(toastOf(newerAction));
      await waitFor(() => expect(animatedAction.isConnected).toBe(false));
      expect(document.activeElement).toBe(toastOf(newerAction));
    });

    it('returns focus to the page when the last toast leaves a region that holds focus', async () => {
      const { host, getByTestId } = await renderHost();
      const toast = host.showToast();
      const pageButton = getByTestId('page-button');
      pageButton.focus();
      pressKey('F6');
      expect(document.activeElement).toBe(container());

      await toast.dismiss();

      expect(document.activeElement).toBe(pageButton);
    });

    it('keeps focus on a region that still shows toasts', async () => {
      const { older, getByTestId } = await showTwoToasts();
      getByTestId('page-button').focus();
      pressKey('F6');
      expect(document.activeElement).toBe(container());

      await older.dismiss();

      expect(document.activeElement).toBe(container());
    });

    it('returns focus to the page once the last toast closes in another region', async () => {
      const { host, getByTestId } = await renderHost();
      const first = host.showToast('top-start');
      const second = host.showToast('bottom-end');
      const pageButton = getByTestId('page-button');
      pageButton.focus();
      pressKey('F6');
      expect(document.activeElement).toBe(container('bottom-end'));

      await second.dismiss();
      expect(document.activeElement).toBe(container('bottom-end'));
      await first.dismiss();

      expect(document.activeElement).toBe(pageButton);
    });

    it('returns focus to the page after a swipe, even from keyboard focus', async () => {
      const { newerAction, toastOf, getByTestId } = await showTwoToasts();
      const otherButton = getByTestId('other-button');
      otherButton.focus();
      await userEvent.keyboard('{Tab}{Tab}');
      expect(document.activeElement).toBe(newerAction);
      const toast = toastOf(newerAction);
      toast.setPointerCapture = vi.fn();

      fireEvent(toast, new PointerEvent('pointerdown', { button: 0, clientX: 0, pointerId: 1 }));
      fireEvent(toast, new PointerEvent('pointermove', { clientX: 200, pointerId: 1 }));
      fireEvent(toast, new PointerEvent('pointerup', { clientX: 200, pointerId: 1 }));

      await waitFor(() => expect(document.activeElement).toBe(otherButton));
    });

    it('returns focus to the page after a pointer close rather than to the next toast', async () => {
      const { newer, newerAction, getByTestId } = await showTwoToasts();
      const pageButton = getByTestId('page-button');
      pageButton.focus();
      await userEvent.click(newerAction);
      expect(document.activeElement).toBe(newerAction);

      await newer.dismiss();

      expect(document.activeElement).toBe(pageButton);
    });
  });

  it('leaves Escape to an input method that is composing', async () => {
    const { host, getByTestId } = await renderHost();
    host.showToast();
    getByTestId('page-button').focus();
    pressKey('F6');

    const event = pressKey('Escape', { isComposing: true });

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(container());
  });

  it("moves to the newest toast's region from an emptied one", async () => {
    const { host, getByTestId } = await renderHost();
    const first = host.showToast('top-start');
    const pageButton = getByTestId('page-button');
    pageButton.focus();
    pressKey('F6');
    expect(document.activeElement).toBe(container('top-start'));

    host.showToast('bottom-end');
    await first.dismiss();
    // focus stays on the emptied top-start region
    expect(document.activeElement).toBe(container('top-start'));

    pressKey('F6');
    expect(document.activeElement).toBe(container('bottom-end'));

    pressKey('F6');
    expect(document.activeElement).toBe(pageButton);
  });

  describe('with a dialog open', () => {
    async function openDialogWithToast() {
      const view = await renderHost();
      view.host.openDialog();
      const dialogButton = await waitFor(() => {
        const button = document.querySelector<HTMLElement>('[data-testid="dialog-button"]');
        expect(button).toBeTruthy();
        return button!;
      });
      dialogButton.focus();
      const toast = view.host.showToast();
      return { ...view, dialogButton, toast };
    }

    it('lets F6 move focus out of the focus trap to the toasts', async () => {
      await openDialogWithToast();

      pressKey('F6');

      expect(document.activeElement).toBe(container());
      // the focus trap reacts to focusin/focusout; give it a chance to pull focus back
      await wait(50);
      expect(document.activeElement).toBe(container());
    });

    it('returns focus into the dialog on Escape without closing it', async () => {
      const { dialogButton } = await openDialogWithToast();

      pressKey('F6');
      expect(document.activeElement).toBe(container());

      pressKey('Escape');

      expect(document.activeElement).toBe(dialogButton);
      await wait(50);
      expect(document.querySelector('[data-testid="dialog"]')).toBeInTheDocument();
    });

    it('keeps the dialog open when a toast is clicked', async () => {
      await openDialogWithToast();
      const action = document.querySelector<HTMLElement>('[data-testid="toast-action"]')!;

      fireEvent.pointerDown(action);
      fireEvent.mouseDown(action);
      fireEvent.pointerUp(action);
      fireEvent.mouseUp(action);
      fireEvent.click(action);

      await wait(50);
      expect(document.querySelector('[data-testid="dialog"]')).toBeInTheDocument();
    });

    it('returns focus into the dialog when a clicked toast dismisses itself', async () => {
      const { dialogButton, toast } = await openDialogWithToast();

      // a click focuses the action, as Chrome does, without F6
      document.querySelector<HTMLElement>('[data-testid="toast-action"]')!.focus();
      await toast.dismiss();

      expect(document.activeElement).toBe(dialogButton);
    });
  });
});
