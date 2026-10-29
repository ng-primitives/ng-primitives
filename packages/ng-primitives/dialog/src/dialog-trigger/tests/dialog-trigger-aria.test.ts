import { Component, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { afterEach, describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpDialogTrigger]="dialog" data-testid="trigger">Open</button>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <button (click)="close()" data-testid="close">Close</button>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    /* !important and a more specific selector override test-setup's global 0s duration */
    [ngpDialog][data-exit] {
      animation: dialog-exit 400ms linear;
      animation-duration: 400ms !important;
    }

    @keyframes dialog-exit {
      to {
        opacity: 0;
      }
    }
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay],
  encapsulation: ViewEncapsulation.None,
})
class DialogTriggerAriaHost {}

describe('NgpDialogTrigger aria-expanded', () => {
  let dialogManager: NgpDialogManager | undefined;

  afterEach(async () => {
    dialogManager?.closeAll();
    // portals attach outside the fixture, so wait for the dialog to leave the DOM
    await waitFor(() => expect(document.querySelector('[data-testid="dialog"]')).toBeNull());
    dialogManager = undefined;
  });

  it('should set aria-expanded="false" while the dialog is closed', async () => {
    const view = await render(DialogTriggerAriaHost);

    expect(view.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should set aria-expanded="true" while the dialog is open', async () => {
    const view = await render(DialogTriggerAriaHost);
    dialogManager = TestBed.inject(NgpDialogManager);
    const trigger = view.getByTestId('trigger');

    trigger.click();

    await waitFor(() => expect(document.querySelector('[data-testid="dialog"]')).not.toBeNull());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should set aria-expanded="false" as soon as closing starts, before the exit animation ends', async () => {
    const view = await render(DialogTriggerAriaHost);
    dialogManager = TestBed.inject(NgpDialogManager);
    const trigger = view.getByTestId('trigger');

    trigger.click();
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    (document.querySelector('[data-testid="close"]') as HTMLButtonElement).click();

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    // the exit animation still keeps the dialog on screen
    expect(document.querySelector('[data-testid="dialog"]')).toHaveAttribute('data-exit');

    await waitFor(() => expect(document.querySelector('[data-testid="dialog"]')).toBeNull());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
