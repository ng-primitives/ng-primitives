import { Component, inject, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpDialog, NgpDialogManager, NgpDialogOverlay } from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpOverlayRegistry } from 'ng-primitives/portal';
import { describe, expect, it, vi } from 'vitest';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="menu-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button
          [ngpMenuItemCloseOnSelect]="false"
          (click)="openDialog()"
          ngpMenuItem
          data-testid="dialog-item"
        >
          Open Dialog
        </button>
      </div>
    </ng-template>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button data-testid="dialog-button">Inside the dialog</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpDialogOverlay, NgpDialog],
})
class MenuDialogComponent {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly dialog = viewChild.required<TemplateRef<unknown>>('dialog');
  readonly menuTrigger = viewChild.required(NgpMenuTrigger);

  // opened from the host, so the dialog's view outlives the menu's content
  openDialog(): void {
    this.dialogManager.open(this.dialog(), { viewContainerRef: this.viewContainerRef });
  }
}

describe('NgpMenu closing behind a dialog it opened', () => {
  it('leaves focus in the dialog, which stays open', async () => {
    const { fixture } = await render(MenuDialogComponent);

    await userEvent.click(screen.getByTestId('menu-trigger'));
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('dialog-item'));
    await waitFor(() => expect(screen.getByTestId('dialog')).toBeInTheDocument());
    const dialogButton = screen.getByTestId('dialog-button');
    dialogButton.focus();
    expect(dialogButton).toHaveFocus();

    // the dialog's focus trap would pull focus back, so watch for the menu taking it at all
    const menuTrigger = screen.getByTestId('menu-trigger');
    let triggerFocused = false;
    menuTrigger.addEventListener('focus', () => (triggerFocused = true));

    // the dialog opted out of closing with the menu, so the menu closes on its own
    fixture.componentInstance.menuTrigger().hide();
    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(dialogButton).toHaveFocus();
    expect(triggerFocused).toBe(false);
  });

  it('leaves focus in an overlay that opted out of closing with it', async () => {
    const { fixture } = await render(MenuDialogComponent);
    const registry = TestBed.inject(NgpOverlayRegistry);
    const menuTrigger = screen.getByTestId('menu-trigger');

    await userEvent.click(menuTrigger);
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
    const menuId = registry.findContainingOverlay(screen.getByTestId('menu'))!;

    // an overlay nested in the menu that stays open when the menu closes, and, unlike a
    // modal dialog, leaves the page focusable
    const independent = document.createElement('div');
    const input = document.createElement('input');
    independent.appendChild(input);
    document.body.appendChild(independent);
    registry.register({
      id: 'independent',
      parentId: menuId,
      cascadeClose: false,
      overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
      getElements: () => [independent],
      triggerElement: screen.getByTestId('dialog-item'),
      dismissPolicy: { outsidePress: false, escapeKey: false },
    });

    try {
      input.focus();
      expect(input).toHaveFocus();

      fixture.componentInstance.menuTrigger().hide();
      await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());

      expect(input).toHaveFocus();
      expect(menuTrigger).not.toHaveFocus();
    } finally {
      registry.deregister('independent');
      independent.remove();
    }
  });
});
