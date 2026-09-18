import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, waitFor } from '@testing-library/angular';
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
  container: HTMLElement | string | null | undefined = null;
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

/** Provides the container config at component level only, so the root config stays the default. */
@Component({
  template: `
    <button
      [ngpDialogTrigger]="dialog"
      [ngpDialogTriggerContainer]="undefined"
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
  providers: [provideDialogConfig({ container: '#ngp-trigger-container' })],
})
class TriggerComponentConfigHost {}

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
    // portals attach outside the fixture, so wait for the dialog to leave the DOM
    await waitFor(() => expect(document.querySelector('[data-testid="dialog"]')).toBeNull());
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

  it('should prefer the input over the global configuration', async () => {
    const globalContainer = document.createElement('div');
    globalContainer.id = 'ngp-global-container';
    document.body.appendChild(globalContainer);

    const view = await render(TriggerContainerHost, {
      providers: [provideDialogConfig({ container: '#ngp-global-container' })],
    });
    view.fixture.componentInstance.container = container;
    view.fixture.detectChanges();
    dialogManager = TestBed.inject(NgpDialogManager);

    view.getByTestId('trigger').click();
    await Promise.resolve();

    expect(container.querySelector('[data-testid="dialog"]')).not.toBeNull();
    expect(globalContainer.querySelector('[data-testid="dialog"]')).toBeNull();
    globalContainer.remove();
  });

  it('should fall back to the global configuration when the input is undefined', async () => {
    const view = await render(TriggerContainerHost, {
      providers: [provideDialogConfig({ container: '#ngp-trigger-container' })],
    });
    view.fixture.componentInstance.container = undefined;
    view.fixture.detectChanges();
    dialogManager = TestBed.inject(NgpDialogManager);

    view.getByTestId('trigger').click();
    await Promise.resolve();

    expect(container.querySelector('[data-testid="dialog"]')).not.toBeNull();
  });

  it('should fall back to a component-level configuration when the input is undefined', async () => {
    const view = await render(TriggerComponentConfigHost);
    dialogManager = TestBed.inject(NgpDialogManager);

    view.getByTestId('trigger').click();
    await Promise.resolve();

    expect(container.querySelector('[data-testid="dialog"]')).not.toBeNull();
  });

  it('should render into the body when the input is null, despite a global container', async () => {
    const view = await render(TriggerContainerHost, {
      providers: [provideDialogConfig({ container: '#ngp-trigger-container' })],
    });
    dialogManager = TestBed.inject(NgpDialogManager);

    view.getByTestId('trigger').click();
    await Promise.resolve();

    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
    const overlay = document.querySelector('[data-testid="dialog"]')?.closest('[ngpDialogOverlay]');
    expect(overlay?.parentElement).toBe(document.body);
  });
});
