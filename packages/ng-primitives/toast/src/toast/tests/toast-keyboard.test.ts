import { Component, inject, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpDialog, NgpDialogManager, NgpDialogOverlay } from 'ng-primitives/dialog';
import { NgpToast, NgpToastManager } from 'ng-primitives/toast';
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

  showToast(): void {
    this.toasts.show(TestToast, { persistent: true });
  }

  openDialog(): void {
    this.dialogs.open(this.dialog(), { viewContainerRef: this.viewContainerRef });
  }
}

function container(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-ngp-toast-container]');
  expect(element).toBeTruthy();
  return element!;
}

function pressKey(key: string): KeyboardEvent {
  const target = document.activeElement ?? document.body;
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
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

  it('does nothing on F6 when there are no toasts', async () => {
    const { getByTestId } = await renderHost();
    const pageButton = getByTestId('page-button');
    pageButton.focus();

    const event = pressKey('F6');

    expect(event.defaultPrevented).toBe(false);
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
