import { fakeAsync, flush } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from '../index';
import { NgpSubmenuTrigger } from '../submenu-trigger/submenu-trigger';

describe('NgpMenuTrigger', () => {
  it('should open a menu on click', fakeAsync(async () => {
    const { getByText } = await render(
      `<button [ngpMenuTrigger]="menu">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="ngp-menu">
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
        <button ngpMenuItem>Item 3</button>
      </div>
    </ng-template>`,
      {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
      },
    );

    const trigger = getByText('Open Menu');
    fireEvent.click(trigger);
    flush();

    const menu = screen.getByTestId('ngp-menu');
    expect(menu).toBeInTheDocument();
  }));

  it('should close menu on outside mouseup', fakeAsync(async () => {
    const { getByText } = await render(
      `<button [ngpMenuTrigger]="menu">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="ngp-menu">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>`,
      {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
      },
    );

    const trigger = getByText('Open Menu');
    fireEvent.click(trigger);
    flush();

    expect(screen.getByTestId('ngp-menu')).toBeInTheDocument();

    fireEvent.mouseUp(document.body);
    flush();

    expect(screen.queryByTestId('ngp-menu')).not.toBeInTheDocument();
  }));

  it('should close menu on Escape', fakeAsync(async () => {
    const { getByText } = await render(
      `<button [ngpMenuTrigger]="menu">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="ngp-menu">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>`,
      {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
      },
    );

    const trigger = getByText('Open Menu');
    fireEvent.click(trigger);
    flush();

    expect(screen.getByTestId('ngp-menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    flush();

    expect(screen.queryByTestId('ngp-menu')).not.toBeInTheDocument();
  }));

  it('should close root menu and submenu on outside mouseup', fakeAsync(async () => {
    const { getByText } = await render(
      `<button [ngpMenuTrigger]="menu">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="ngp-menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">Open Submenu</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="ngp-submenu">
        <button ngpMenuItem>Submenu Item</button>
      </div>
    </ng-template>`,
      {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
      },
    );

    fireEvent.click(getByText('Open Menu'));
    flush();

    fireEvent.click(screen.getByTestId('submenu-trigger'));
    flush();

    expect(screen.getByTestId('ngp-menu')).toBeInTheDocument();
    expect(screen.getByTestId('ngp-submenu')).toBeInTheDocument();

    fireEvent.mouseUp(document.body);
    flush();

    expect(screen.queryByTestId('ngp-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ngp-submenu')).not.toBeInTheDocument();
  }));

  it('should close root menu and submenu on Escape', fakeAsync(async () => {
    const { getByText } = await render(
      `<button [ngpMenuTrigger]="menu">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="ngp-menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">Open Submenu</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="ngp-submenu">
        <button ngpMenuItem data-testid="submenu-item">Submenu Item</button>
      </div>
    </ng-template>`,
      {
        imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
      },
    );

    fireEvent.click(getByText('Open Menu'));
    flush();

    fireEvent.click(screen.getByTestId('submenu-trigger'));
    flush();

    expect(screen.getByTestId('ngp-menu')).toBeInTheDocument();
    expect(screen.getByTestId('ngp-submenu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    flush();

    expect(screen.queryByTestId('ngp-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ngp-submenu')).not.toBeInTheDocument();
  }));
});
