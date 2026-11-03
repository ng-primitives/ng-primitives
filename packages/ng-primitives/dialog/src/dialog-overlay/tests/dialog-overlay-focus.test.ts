import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogConfig,
  NgpDialogContext,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogRef,
} from 'ng-primitives/dialog';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <ng-template #dialog>
      <div
        ngpDialogOverlay
        data-testid="overlay"
        style="position: fixed; inset: 0; display: grid; place-items: center"
      >
        <div ngpDialog data-testid="dialog" style="width: 200px; height: 100px">
          <input (blur)="committed = true" data-testid="field" />
          <button data-testid="other">Other</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay],
})
class BackdropHost {
  readonly dialog = viewChild.required<TemplateRef<NgpDialogContext>>('dialog');
  readonly viewContainerRef = inject(ViewContainerRef);
  /** Set when the field blurs, like a control that commits its value on blur. */
  committed = false;
}

async function openDialog(config: NgpDialogConfig = {}) {
  const { fixture } = await render(BackdropHost);
  const host = fixture.componentInstance;
  const manager = fixture.debugElement.injector.get(NgpDialogManager);
  const ref = manager.open(host.dialog(), { viewContainerRef: host.viewContainerRef, ...config });
  fixture.detectChanges();

  const field = await waitFor(() => {
    const element = document.querySelector<HTMLInputElement>('[data-testid="field"]');
    expect(element).toBeInTheDocument();
    return element!;
  });
  field.focus();
  expect(document.activeElement).toBe(field);

  return { host, manager, ref, field };
}

/** A real pointer press on the backdrop, clear of the panel. */
async function pressBackdrop(): Promise<void> {
  const overlay = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
  await userEvent.click(overlay, { position: { x: 5, y: 5 } });
}

describe('NgpDialogOverlay focus', () => {
  let ref: NgpDialogRef | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    if (ref) {
      ref.disableClose = false;
      await ref.close();
    }
    ref = undefined;
  });

  it('should return focus to the dialog when the backdrop cannot close it', async () => {
    const dialog = await openDialog({ closeOnOutsideClick: false });
    ref = dialog.ref;

    await pressBackdrop();

    expect(dialog.manager.openDialogs).toContain(ref);
    expect(document.activeElement).toBe(dialog.field);
  });

  it('should return focus to the dialog when the dialog has close disabled', async () => {
    const dialog = await openDialog();
    ref = dialog.ref;
    ref.disableClose = true;

    await pressBackdrop();

    expect(dialog.manager.openDialogs).toContain(ref);
    expect(document.activeElement).toBe(dialog.field);
  });

  it('should blur before a sync guard runs and return focus when it keeps the dialog open', async () => {
    let committedWhenGuarded: boolean | undefined;
    const dialog = await openDialog({
      closeOnOutsideClick: () => {
        committedWhenGuarded = dialog.host.committed;
        return false;
      },
    });
    ref = dialog.ref;

    await pressBackdrop();

    expect(committedWhenGuarded).toBe(true);
    expect(dialog.manager.openDialogs).toContain(ref);
    expect(document.activeElement).toBe(dialog.field);
  });

  it('should blur before an async guard runs and return focus when it keeps the dialog open', async () => {
    let committedWhenGuarded: boolean | undefined;
    const dialog = await openDialog({
      closeOnOutsideClick: async () => {
        committedWhenGuarded = dialog.host.committed;
        return false;
      },
    });
    ref = dialog.ref;

    await pressBackdrop();

    expect(committedWhenGuarded).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(dialog.field));
    expect(dialog.manager.openDialogs).toContain(ref);
  });

  it('should blur before a guard that closes the dialog runs', async () => {
    let committedWhenGuarded: boolean | undefined;
    const dialog = await openDialog({
      closeOnOutsideClick: () => {
        committedWhenGuarded = dialog.host.committed;
        return true;
      },
    });
    ref = dialog.ref;

    await pressBackdrop();

    expect(committedWhenGuarded).toBe(true);
    expect(dialog.manager.openDialogs).not.toContain(ref);
  });

  it('should return focus to the dialog when the guard throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const dialog = await openDialog({
      closeOnOutsideClick: () => {
        throw new Error('guard failed');
      },
    });
    ref = dialog.ref;

    await pressBackdrop();

    expect(dialog.manager.openDialogs).toContain(ref);
    expect(document.activeElement).toBe(dialog.field);
  });

  it('should return focus to the dialog when the guard rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const dialog = await openDialog({
      closeOnOutsideClick: () => Promise.reject(new Error('guard failed')),
    });
    ref = dialog.ref;

    await pressBackdrop();

    await waitFor(() => expect(document.activeElement).toBe(dialog.field));
    expect(dialog.manager.openDialogs).toContain(ref);
  });

  it('should leave focus where the guard moved it', async () => {
    const dialog = await openDialog({
      closeOnOutsideClick: () => {
        document.querySelector<HTMLElement>('[data-testid="other"]')!.focus();
        return false;
      },
    });
    ref = dialog.ref;

    await pressBackdrop();

    expect(document.activeElement).toBe(document.querySelector('[data-testid="other"]'));
  });
});
