import { Component, inject, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpDialog, NgpDialogManager, NgpDialogOverlay } from 'ng-primitives/dialog';
import { NgpToast, NgpToastManager, NgpToastPlacement, NgpToastRef } from 'ng-primitives/toast';
import { afterEach, describe, expect, it } from 'vitest';

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

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button data-testid="dialog-button">Inside</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay],
})
class ToastKeyboardHost {
  readonly toasts = inject(NgpToastManager);
  readonly dialogs = inject(NgpDialogManager);
  readonly dialog = viewChild.required<TemplateRef<unknown>>('dialog');
  private readonly viewContainerRef = inject(ViewContainerRef);

  showToast(placement?: NgpToastPlacement): NgpToastRef {
    return this.toasts.show(TestToast, { persistent: true, placement });
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

function pressKey(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const target = document.activeElement ?? document.body;
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function renderHost() {
  const view = await render(ToastKeyboardHost);
  return { host: view.fixture.componentInstance, getByTestId: view.getByTestId };
}

afterEach(() => {
  // Toasts are portaled to document.body and outlive the fixture in browser mode.
  document.querySelectorAll('[data-ngp-toast-container]').forEach(c => c.remove());
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
      view.host.showToast();
      return { ...view, dialogButton };
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
  });
});
