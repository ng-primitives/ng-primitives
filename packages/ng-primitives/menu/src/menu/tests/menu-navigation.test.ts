import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { Component, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, provideMenuConfig } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" ngpMenuTriggerCloseOnNavigation data-testid="trigger">
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuEnabledComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" [ngpMenuTriggerCloseOnNavigation]="false" data-testid="trigger">
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuDisabledComponent {}

async function openMenu(component: typeof MenuComponent, providers: Provider[] = []) {
  const view = await render(component, { providers: [provideLocationMocks(), ...providers] });
  fireEvent.click(view.getByTestId('trigger'));
  await waitFor(() => expect(screen.queryByTestId('menu')).toBeInTheDocument());
  return view;
}

const withRouter = provideRouter([{ path: '**', children: [] }]);

describe('NgpMenu close on navigation', () => {
  it('should close on a router navigation when enabled on the trigger', async () => {
    const view = await openMenu(MenuEnabledComponent, [withRouter]);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
    expect(view.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should close on a router navigation when enabled in the global config', async () => {
    await openMenu(MenuComponent, [withRouter, provideMenuConfig({ closeOnNavigation: true })]);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
  });

  it('should close on a URL change without a router', async () => {
    await openMenu(MenuEnabledComponent);

    TestBed.inject(Location).go('/other');

    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
  });

  it('should stay open by default', async () => {
    await openMenu(MenuComponent, [withRouter]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('should stay open when the trigger disables it over the global config', async () => {
    await openMenu(MenuDisabledComponent, [
      withRouter,
      provideMenuConfig({ closeOnNavigation: true }),
    ]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });
});
