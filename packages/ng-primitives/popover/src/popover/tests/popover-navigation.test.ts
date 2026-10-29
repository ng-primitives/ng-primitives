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
class PopoverOptOutComponent {}

async function openPopover(component: typeof PopoverComponent, providers: Provider[] = []) {
  const view = await render(component, {
    providers: [provideRouter([{ path: '**', children: [] }]), ...providers],
  });
  fireEvent.click(view.getByTestId('trigger'));
  await waitFor(() => expect(screen.queryByTestId('popover')).toBeInTheDocument());
  return view;
}

describe('NgpPopover close on navigation', () => {
  it('should close the popover when the router navigates', async () => {
    const view = await openPopover(PopoverComponent);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
    expect(view.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should stay open when closeOnNavigation is false on the trigger', async () => {
    await openPopover(PopoverOptOutComponent);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('should stay open when closeOnNavigation is false in the global config', async () => {
    await openPopover(PopoverComponent, [providePopoverConfig({ closeOnNavigation: false })]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('popover')).toBeInTheDocument();
  });

  it('should open and close without a router', async () => {
    const view = await render(PopoverComponent);
    const trigger = view.getByTestId('trigger');

    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByTestId('popover')).toBeInTheDocument());

    fireEvent.click(trigger);
    await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
  });
});
