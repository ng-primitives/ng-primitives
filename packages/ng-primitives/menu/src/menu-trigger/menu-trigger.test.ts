import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';
import { describe, expect, it } from 'vitest';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from '../index';

describe('NgpMenuTrigger', () => {
  it('should open a menu on click', async () => {
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

    const menu = await waitFor(() => screen.getByTestId('ngp-menu'));
    expect(menu).toBeInTheDocument();
  });

  it('should close previous menu when combining tooltip with menu on buttons (fixes #728)', async () => {
    @Component({
      template: `
        <!-- Button A with tooltip + menu -->
        <button [ngpTooltipTrigger]="tooltipA" [ngpMenuTrigger]="menuA" data-testid="button-a">
          Button A
        </button>
        <ng-template #tooltipA>
          <div ngpTooltip>Tooltip A</div>
        </ng-template>
        <ng-template #menuA>
          <div ngpMenu data-testid="menu-a">
            <button ngpMenuItem>Item A1</button>
            <button ngpMenuItem>Item A2</button>
          </div>
        </ng-template>

        <!-- Button B with tooltip + menu -->
        <button [ngpTooltipTrigger]="tooltipB" [ngpMenuTrigger]="menuB" data-testid="button-b">
          Button B
        </button>
        <ng-template #tooltipB>
          <div ngpTooltip>Tooltip B</div>
        </ng-template>
        <ng-template #menuB>
          <div ngpMenu data-testid="menu-b">
            <button ngpMenuItem>Item B1</button>
            <button ngpMenuItem>Item B2</button>
          </div>
        </ng-template>
      `,
      imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpTooltipTrigger, NgpTooltip],
    })
    class TooltipWithMenuComponent {}

    const { getByTestId } = await render(TooltipWithMenuComponent);

    const buttonA = getByTestId('button-a');
    const buttonB = getByTestId('button-b');

    // Click Button A → opens Menu A
    fireEvent.click(buttonA);

    await waitFor(() => expect(screen.getByTestId('menu-a')).toBeInTheDocument());

    // Click Button B → should close Menu A and open Menu B
    fireEvent.click(buttonB);

    await waitFor(() => {
      expect(screen.getByTestId('menu-b')).toBeInTheDocument();
      // Menu A should be closed
      expect(screen.queryByTestId('menu-a')).not.toBeInTheDocument();
    });
  });
});
