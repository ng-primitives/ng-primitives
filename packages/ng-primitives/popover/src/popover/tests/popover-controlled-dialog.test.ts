import { Component, inject, signal, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpDialog, NgpDialogManager, NgpDialogOverlay } from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button (click)="openDialog()" data-testid="open-dialog">Open dialog</button>

    <ng-template #dialog>
      <div ngpDialogOverlay style="position: fixed; inset: 0" data-testid="overlay">
        <div ngpDialog style="width: 200px; margin: 200px auto" data-testid="dialog">
          <button
            [ngpPopoverTrigger]="popover"
            [ngpPopoverTriggerOpen]="open()"
            (ngpPopoverTriggerOpenChange)="onOpenChange($event)"
            data-testid="popover-trigger"
          >
            Popover
          </button>
          <button (click)="open.set(true)" data-testid="open-from-code">Open from code</button>
        </div>
      </div>
    </ng-template>

    <ng-template #popover>
      <div ngpPopover data-testid="popover">
        <button data-testid="popover-button">Action</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, NgpDialogOverlay, NgpDialog],
})
class BoundPopoverInDialogComponent {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly dialog = viewChild.required<TemplateRef<unknown>>('dialog');
  readonly open = signal(false);
  acceptClose = true;

  openDialog(): void {
    this.dialogManager.open(this.dialog(), { viewContainerRef: this.viewContainerRef });
  }

  onOpenChange(open: boolean): void {
    if (open || this.acceptClose) {
      this.open.set(open);
    }
  }
}

describe('NgpPopoverTrigger with a bound open state in a dialog', () => {
  afterEach(async () => {
    TestBed.inject(NgpDialogManager).closeAll();
    await waitFor(() => expect(document.querySelector('[ngpDialog]')).toBeNull());
  });

  async function openPopoverFromCode(): Promise<BoundPopoverInDialogComponent> {
    const { fixture } = await render(BoundPopoverInDialogComponent);
    fireEvent.click(screen.getByTestId('open-dialog'));
    await screen.findByTestId('dialog');
    await userEvent.click(screen.getByTestId('open-from-code'));
    await screen.findByTestId('popover');
    screen.getByTestId('popover-button').focus();
    return fixture.componentInstance;
  }

  /** A real click on the backdrop corner, away from the dialog and the popover. */
  async function clickBackdrop(): Promise<void> {
    await userEvent.click(screen.getByTestId('overlay'), { position: { x: 5, y: 5 } });
  }

  it('returns focus to where it was when the popover opened on Escape', async () => {
    await openPopoverFromCode();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
    expect(document.activeElement).toBe(screen.getByTestId('open-from-code'));
  });

  it('keeps a backdrop press the binding declined out of a later Escape', async () => {
    const host = await openPopoverFromCode();
    host.acceptClose = false;

    await clickBackdrop();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.getByTestId('popover')).toBeInTheDocument();
    expect(TestBed.inject(NgpDialogManager).openDialogs.length).toBe(1);

    host.acceptClose = true;
    screen.getByTestId('popover-button').focus();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
    expect(document.activeElement).toBe(screen.getByTestId('open-from-code'));
  });
});
