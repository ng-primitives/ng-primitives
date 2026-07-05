import { Component, TemplateRef, ViewContainerRef, inject, input, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogContext,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
  provideDialogState,
} from 'ng-primitives/dialog';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring the reusable dialog component at
 * apps/components/src/app/pages/reusable-components/dialog. The overlay is applied
 * to the host and the dialog state is hoisted so title/description can live in
 * projected content.
 */
@Component({
  selector: 'app-dialog',
  hostDirectives: [NgpDialogOverlay],
  imports: [NgpDialog, NgpDialogTitle, NgpDialogDescription],
  providers: [provideDialogState()],
  template: `
    <div ngpDialog data-testid="dialog">
      <h2 ngpDialogTitle data-testid="title">{{ header() }}</h2>
      <p ngpDialogDescription data-testid="description">
        <ng-content />
      </p>
    </div>
  `,
})
class DialogFixture {
  readonly header = input.required<string>();
}

/**
 * Host holding the dialog template. The reusable component is opened through the
 * dialog manager (the app uses NgpDialogTrigger, which resolves the root
 * ViewContainerRef — not available in the render harness, so we pass it directly).
 */
@Component({
  template: `
    <ng-template #dialog let-close="close">
      <app-dialog header="Dialog header">
        <p>This is a dialog body.</p>
        <button (click)="close()" data-testid="close">Close</button>
      </app-dialog>
    </ng-template>
  `,
  imports: [DialogFixture],
})
class DialogHost {
  readonly dialog = viewChild.required<TemplateRef<NgpDialogContext>>('dialog');
  readonly viewContainerRef = inject(ViewContainerRef);
}

describe('Dialog (reusable component)', () => {
  let dialogManager: NgpDialogManager | undefined;

  async function openDialog() {
    const view = await render(DialogHost);
    dialogManager = TestBed.inject(NgpDialogManager);
    const component = view.fixture.componentInstance;
    dialogManager.open(component.dialog(), { viewContainerRef: component.viewContainerRef });
    await view.fixture.whenStable();
    return view;
  }

  function dispatchOverlayClick(overlay: HTMLElement): void {
    overlay.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    overlay.click();
  }

  afterEach(async () => {
    dialogManager?.closeAll();
    await Promise.resolve();
    await Promise.resolve();
    dialogManager = undefined;
  });

  it('should render the dialog', async () => {
    await openDialog();
    expect(document.querySelector('[data-testid="dialog"]')).toBeTruthy();
    expect(dialogManager!.openDialogs.length).toBe(1);
  });

  it('should expose the correct dialog roles and attributes', async () => {
    await openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    expect(dialog?.getAttribute('role')).toBe('dialog');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('tabindex')).toBe('-1');
  });

  it('should wire aria-labelledby to the title and aria-describedby to the description', async () => {
    await openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]');
    const title = document.querySelector('[data-testid="title"]');
    const description = document.querySelector('[data-testid="description"]');

    expect(dialog?.getAttribute('aria-labelledby')).toContain(title!.getAttribute('id')!);
    expect(dialog?.getAttribute('aria-describedby')).toContain(description!.getAttribute('id')!);
  });

  it('should render the projected content and header', async () => {
    await openDialog();
    expect(document.querySelector('[data-testid="title"]')?.textContent).toContain('Dialog header');
    expect(document.body.textContent).toContain('This is a dialog body.');
  });

  it('should close when the close button is clicked', async () => {
    await openDialog();
    const close = document.querySelector('[data-testid="close"]') as HTMLElement;
    close.click();
    await new Promise(r => setTimeout(r, 0));
    expect(dialogManager!.openDialogs.length).toBe(0);
  });

  it('should close on Escape', async () => {
    await openDialog();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(dialogManager!.openDialogs.length).toBe(0);
  });

  it('should close on backdrop (overlay) click', async () => {
    await openDialog();
    const overlay = document.querySelector('app-dialog') as HTMLElement;
    dispatchOverlayClick(overlay);
    await new Promise(r => setTimeout(r, 0));
    expect(dialogManager!.openDialogs.length).toBe(0);
  });

  it('should NOT close when the dialog body is clicked', async () => {
    await openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;
    dialog.click();
    await new Promise(r => setTimeout(r, 0));
    expect(dialogManager!.openDialogs.length).toBe(1);
  });

  it('should move focus into the dialog when opened', async () => {
    await openDialog();
    const dialog = document.querySelector('[data-testid="dialog"]') as HTMLElement;
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });
});
