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
class MenuOptOutComponent {}

async function openMenu(component: typeof MenuComponent, providers: Provider[] = []) {
  const view = await render(component, {
    providers: [provideRouter([{ path: '**', children: [] }]), ...providers],
  });
  fireEvent.click(view.getByTestId('trigger'));
  await waitFor(() => expect(screen.queryByTestId('menu')).toBeInTheDocument());
  return view;
}

describe('NgpMenu close on navigation', () => {
  it('should close the menu when the router navigates', async () => {
    const view = await openMenu(MenuComponent);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
    expect(view.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should stay open when closeOnNavigation is false on the trigger', async () => {
    await openMenu(MenuOptOutComponent);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('should stay open when closeOnNavigation is false in the global config', async () => {
    await openMenu(MenuComponent, [provideMenuConfig({ closeOnNavigation: false })]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });
});
