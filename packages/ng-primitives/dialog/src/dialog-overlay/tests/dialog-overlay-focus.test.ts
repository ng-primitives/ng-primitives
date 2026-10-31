import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogContext,
  NgpDialogManager,
  NgpDialogOverlay,
} from 'ng-primitives/dialog';
import { describe, expect, it } from 'vitest';
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
          <button data-testid="panel-button">Action</button>
        </div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialog, NgpDialogOverlay],
})
class BackdropHost {
  readonly dialog = viewChild.required<TemplateRef<NgpDialogContext>>('dialog');
  readonly viewContainerRef = inject(ViewContainerRef);
}

describe('NgpDialogOverlay focus', () => {
  it('should keep focus in the dialog when a backdrop press does not close it', async () => {
    const { fixture } = await render(BackdropHost);
    const manager = fixture.debugElement.injector.get(NgpDialogManager);
    const ref = manager.open(fixture.componentInstance.dialog(), {
      viewContainerRef: fixture.componentInstance.viewContainerRef,
      closeOnClick: false,
    });
    fixture.detectChanges();

    const button = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-testid="panel-button"]');
      expect(element).toBeInTheDocument();
      return element!;
    });
    button.focus();
    expect(document.activeElement).toBe(button);

    // A real pointer press on the backdrop, clear of the panel.
    const overlay = document.querySelector<HTMLElement>('[data-testid="overlay"]')!;
    await userEvent.click(overlay, { position: { x: 5, y: 5 } });

    expect(manager.openDialogs).toContain(ref);
    expect(document.querySelector('[data-testid="dialog"]')!.contains(document.activeElement)).toBe(
      true,
    );

    await ref.close();
  });
});
