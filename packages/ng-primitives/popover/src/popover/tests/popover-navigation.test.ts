import { Location } from '@angular/common';
import { provideLocationMocks, SpyLocation } from '@angular/common/testing';
import { Component, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger, providePopoverConfig } from 'ng-primitives/popover';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>

    <ng-template #content>
      <div ngpPopover data-testid="popover">Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverComponent {}

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" ngpPopoverTriggerCloseOnNavigation data-testid="trigger">
      Open
    </button>

    <ng-template #content>
      <div ngpPopover data-testid="popover">Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverEnabledComponent {}

@Component({
  template: `
    <button
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerCloseOnNavigation]="false"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #content>
      <div ngpPopover data-testid="popover">Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverDisabledComponent {}

async function openPopover(component: typeof PopoverComponent, providers: Provider[] = []) {
  const view = await render(component, { providers: [provideLocationMocks(), ...providers] });
  fireEvent.click(view.getByTestId('trigger'));
  await waitFor(() => expect(screen.queryByTestId('popover')).toBeInTheDocument());
  return view;
}

const withRouter = provideRouter([{ path: '**', children: [] }]);

describe('NgpPopover close on navigation', () => {
  it('should close on a router navigation when enabled on the trigger', async () => {
    const view = await openPopover(PopoverEnabledComponent, [withRouter]);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
    expect(view.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should close on a router navigation when enabled in the global config', async () => {
    await openPopover(PopoverComponent, [
      withRouter,
      providePopoverConfig({ closeOnNavigation: true }),
    ]);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
  });

  it('should close on a URL change without a router', async () => {
    await openPopover(PopoverEnabledComponent);

    TestBed.inject(Location).go('/other');

    await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
  });

  it('should close on back/forward navigation', async () => {
    await openPopover(PopoverEnabledComponent);

    (TestBed.inject(Location) as SpyLocation).simulateUrlPop('/previous');

    await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
  });

  it('should stay open by default', async () => {
    await openPopover(PopoverComponent, [withRouter]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('should stay open when the trigger disables it over the global config', async () => {
    await openPopover(PopoverDisabledComponent, [
      withRouter,
      providePopoverConfig({ closeOnNavigation: true }),
    ]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });
});
