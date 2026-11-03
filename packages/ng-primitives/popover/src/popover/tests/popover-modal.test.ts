import { Component, inject, signal, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpDialog, NgpDialogManager } from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger, providePopoverConfig } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  imports: [NgpPopoverTrigger, NgpPopover, NgpDialog],
  template: `
    <button (click)="pageClicks.set(pageClicks() + 1)" data-testid="page-button">Page</button>

    <section data-ngp-modal-exempt>
      <button (click)="exemptClicks.set(exemptClicks() + 1)" data-testid="exempt-button">
        Exempt
      </button>
    </section>

    <button [ngpPopoverTrigger]="content" [ngpPopoverTriggerModal]="modal()" data-testid="trigger">
      Open
    </button>

    <ng-template #content>
      <div ngpPopover data-testid="popover">
        <button (click)="openDialog()" data-testid="open-dialog">Open dialog</button>
      </div>
    </ng-template>

    <ng-template #dialog let-close="close">
      <div ngpDialog data-testid="dialog">
        <button (click)="close()" data-testid="close-dialog">Close</button>
      </div>
    </ng-template>
  `,
})
class ModalPopoverHost {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly viewContainerRef = inject(ViewContainerRef);
  readonly dialog = viewChild.required<TemplateRef<unknown>>('dialog');
  readonly modal = signal(true);
  readonly pageClicks = signal(0);
  readonly exemptClicks = signal(0);

  openDialog(): void {
    this.dialogManager.open(this.dialog(), { viewContainerRef: this.viewContainerRef });
  }
}

@Component({
  imports: [NgpPopoverTrigger, NgpPopover, NgpDialog],
  template: `
    <button (click)="open(outer)" data-testid="open-outer">Open</button>

    <ng-template #outer>
      <div ngpDialog data-testid="outer">
        <button data-testid="outer-button">Outer</button>
        <button [ngpPopoverTrigger]="content" ngpPopoverTriggerModal data-testid="trigger">
          Open
        </button>
      </div>
    </ng-template>

    <ng-template #content>
      <div ngpPopover data-testid="popover">
        <button (click)="open(inner)" data-testid="open-dialog">Open dialog</button>
      </div>
    </ng-template>

    <ng-template #inner>
      <div ngpDialog data-testid="dialog">Inner</div>
    </ng-template>
  `,
})
class NestedDialogsHost {
  private readonly dialogManager = inject(NgpDialogManager);
  private readonly viewContainerRef = inject(ViewContainerRef);
  readonly inner = viewChild.required<TemplateRef<unknown>>('inner');

  open(template: TemplateRef<unknown>): void {
    this.dialogManager.open(template, { viewContainerRef: this.viewContainerRef });
  }
}

function isInert(element: Element): boolean {
  return element.closest('[inert]') !== null;
}

async function openPopover(): Promise<HTMLElement> {
  await userEvent.click(screen.getByTestId('trigger'));
  return screen.findByTestId('popover');
}

/** Click like a user would. `force` skips Playwright's check that the target takes pointer events. */
async function clickThrough(element: HTMLElement): Promise<void> {
  await userEvent.click(element, { force: true });
}

describe('NgpPopoverTrigger modal', () => {
  // The pointer keeps its position across test files: park it where nothing renders, so a later
  // file does not open something on hover.
  afterEach(async () => {
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('makes the rest of the page inert while it is open', async () => {
    await render(ModalPopoverHost);
    const popover = await openPopover();

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
    expect(isInert(popover)).toBe(false);
  });

  it('keeps the trigger usable, so pressing it closes the popover', async () => {
    await render(ModalPopoverHost);
    await openPopover();

    expect(isInert(screen.getByTestId('trigger'))).toBe(false);

    await userEvent.click(screen.getByTestId('trigger'));

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
  });

  it('closes on a click outside without letting the click through', async () => {
    const { fixture } = await render(ModalPopoverHost);
    await openPopover();

    await clickThrough(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(0);
    expect(isInert(screen.getByTestId('page-button'))).toBe(false);
  });

  it('lets the click through when it is not modal', async () => {
    const { fixture } = await render(ModalPopoverHost);
    fixture.componentInstance.modal.set(false);
    fixture.detectChanges();
    await openPopover();

    expect(isInert(screen.getByTestId('page-button'))).toBe(false);

    await userEvent.click(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(1);
  });

  it('returns focus to the trigger after a click outside', async () => {
    await render(ModalPopoverHost);
    await openPopover();

    await clickThrough(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
    expect(document.activeElement).toBe(screen.getByTestId('trigger'));
  });

  it('closes on a synthetic click outside and lets it through', async () => {
    const { fixture } = await render(ModalPopoverHost);
    await openPopover();

    fireEvent.click(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(1);
  });

  it('keeps an exempt element usable', async () => {
    const { fixture } = await render(ModalPopoverHost);
    await openPopover();

    expect(isInert(screen.getByTestId('exempt-button'))).toBe(false);

    await userEvent.click(screen.getByTestId('exempt-button'));

    expect(fixture.componentInstance.exemptClicks()).toBe(1);
    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('applies a change of the input the next time it opens', async () => {
    const { fixture } = await render(ModalPopoverHost);
    await openPopover();
    await userEvent.click(screen.getByTestId('trigger'));
    await waitFor(() => expect(screen.queryByTestId('popover')).toBeNull());

    fixture.componentInstance.modal.set(false);
    fixture.detectChanges();
    await openPopover();

    expect(isInert(screen.getByTestId('page-button'))).toBe(false);
  });

  it('can be made modal from the config', async () => {
    @Component({
      imports: [NgpPopoverTrigger, NgpPopover],
      providers: [providePopoverConfig({ modal: true })],
      template: `
        <button data-testid="page-button">Page</button>
        <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>
        <ng-template #content><div ngpPopover data-testid="popover">Popover</div></ng-template>
      `,
    })
    class ConfiguredHost {}

    await render(ConfiguredHost);
    await openPopover();

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
  });

  describe('with a dialog opened from it', () => {
    afterEach(() => TestBed.inject(NgpDialogManager).closeAll());

    it('keeps the dialog usable', async () => {
      await render(ModalPopoverHost);
      await openPopover();

      await userEvent.click(screen.getByTestId('open-dialog'));
      const dialog = await screen.findByTestId('dialog');

      expect(isInert(dialog)).toBe(false);
      expect(isInert(screen.getByTestId('page-button'))).toBe(true);
    });

    it('keeps the dialog usable when the popover itself is in a dialog', async () => {
      await render(NestedDialogsHost);
      await userEvent.click(screen.getByTestId('open-outer'));
      await screen.findByTestId('outer');
      await openPopover();

      expect(isInert(screen.getByTestId('outer-button'))).toBe(true);

      await userEvent.click(screen.getByTestId('open-dialog'));
      const dialog = await screen.findByTestId('dialog');

      expect(isInert(dialog)).toBe(false);
      expect(isInert(screen.getByTestId('outer-button'))).toBe(true);
    });

    it('keeps a dialog opened while the focus is outside the popover usable', async () => {
      const { fixture } = await render(NestedDialogsHost);
      await userEvent.click(screen.getByTestId('open-outer'));
      await screen.findByTestId('outer');
      await openPopover();

      // Safari does not focus a clicked button, so the dialog can't be traced back to the popover
      (document.activeElement as HTMLElement | null)?.blur();
      fixture.componentInstance.open(fixture.componentInstance.inner());
      const dialog = await screen.findByTestId('dialog');

      expect(isInert(dialog)).toBe(false);
    });

    it('keeps the dialog usable while it closes', async () => {
      await render(ModalPopoverHost);
      await openPopover();
      await userEvent.click(screen.getByTestId('open-dialog'));
      const dialog = await screen.findByTestId('dialog');

      const [dialogRef] = TestBed.inject(NgpDialogManager).openDialogs;
      dialogRef.close();

      expect(dialog.isConnected).toBe(true);
      expect(isInert(dialog)).toBe(false);
      await waitFor(() => expect(dialog.isConnected).toBe(false));
      expect(screen.getByTestId('popover')).toBeInTheDocument();
    });
  });
});
