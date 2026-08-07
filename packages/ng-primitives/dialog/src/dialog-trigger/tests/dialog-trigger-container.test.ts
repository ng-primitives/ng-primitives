import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
  provideDialogConfig,
} from 'ng-primitives/dialog';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

@Component({
  template: `
    <button
      [ngpDialogTrigger]="dialog"
      [ngpDialogTriggerContainer]="container"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">Dialog content</div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay],
})
class TriggerContainerHost {
  container: HTMLElement | string | null = null;
}

@Component({
  template: `
    <button [ngpDialogTrigger]="dialog" data-testid="trigger">Open</button>

    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">Dialog content</div>
      </div>
    </ng-template>
  `,
  imports: [NgpDialogTrigger, NgpDialog, NgpDialogOverlay],
})
class TriggerConfigHost {}

describe('NgpDialogTrigger container', () => {
  let container: HTMLElement;
  let dialogManager: NgpDialogManager | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'ngp-trigger-container';
    document.body.appendChild(container);
  });

  afterEach(async () => {
    dialogManager?.closeAll();
    await Promise.resolve();
    await Promise.resolve();
    dialogManager = undefined;
    container.remove();
  });

  it('should render the dialog in the container from the input', async () => {
    const view = await render(TriggerContainerHost);
    view.fixture.componentInstance.container = container;
    view.fixture.detectChanges();
    dialogManager = TestBed.inject(NgpDialogManager);

    view.getByTestId('trigger').click();
    await Promise.resolve();

    expect(container.querySelector('[data-testid="dialog"]')).not.toBeNull();
  });

  it('should render the dialog in the container from the global configuration', async () => {
    const view = await render(TriggerConfigHost, {
      providers: [provideDialogConfig({ container: '#ngp-trigger-container' })],
    });
    dialogManager = TestBed.inject(NgpDialogManager);

    view.getByTestId('trigger').click();
    await Promise.resolve();

    expect(container.querySelector('[data-testid="dialog"]')).not.toBeNull();
  });
});
