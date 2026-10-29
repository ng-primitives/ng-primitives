import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpMenuTriggerGroup } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <input data-testid="before" />
    <div style="height: 80px" data-testid="away"></div>
    <button [ngpMenuTrigger]="menu" [ngpMenuTriggerOpenTriggers]="['hover']" data-testid="trigger">
      Hover me
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class HoverMenuComponent {}

@Component({
  template: `
    <input data-testid="before" />
    <div style="height: 80px" data-testid="away"></div>
    <div ngpMenuTriggerGroup>
      <button [ngpMenuTrigger]="menu" [ngpMenuTriggerOpenTriggers]="['hover']" data-testid="first">
        First
      </button>
      <button [ngpMenuTrigger]="menu" [ngpMenuTriggerOpenTriggers]="['hover']" data-testid="second">
        Second
      </button>
    </div>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenuTriggerGroup, NgpMenu, NgpMenuItem],
})
class HoverGroupComponent {}

describe('NgpMenu opened on hover', () => {
  it('leaves focus where it was when the pointer moves away', async () => {
    await render(HoverMenuComponent);
    const before = screen.getByTestId('before');
    before.focus();

    await userEvent.hover(screen.getByTestId('trigger'));
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    await userEvent.hover(screen.getByTestId('away'));
    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());

    expect(before).toHaveFocus();
  });

  it('does not focus the trigger when nothing had focus before the hover', async () => {
    await render(HoverMenuComponent);
    (document.activeElement as HTMLElement | null)?.blur();
    const trigger = screen.getByTestId('trigger');

    await userEvent.hover(trigger);
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    await userEvent.hover(screen.getByTestId('away'));
    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());

    expect(trigger).not.toHaveFocus();
    expect(document.activeElement).toBe(document.body);
  });

  it('leaves focus where it was across a trigger group handoff', async () => {
    await render(HoverGroupComponent);
    const before = screen.getByTestId('before');
    before.focus();

    await userEvent.hover(screen.getByTestId('first'));
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
    await userEvent.hover(screen.getByTestId('second'));
    await waitFor(() => expect(screen.getByTestId('second')).toHaveAttribute('data-open'));

    await userEvent.hover(screen.getByTestId('away'));
    await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());

    expect(before).toHaveFocus();
  });
});
