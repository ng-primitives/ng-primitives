import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpMenuTriggerGroup } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <input data-testid="before" />
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
    <div ngpMenuTriggerGroup>
      <button
        [ngpMenuTrigger]="menu"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        data-testid="first"
      >
        First
      </button>
      <button
        [ngpMenuTrigger]="menu"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        data-testid="second"
      >
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

/** Leave the trigger heading away from the menu, so no hover bridge keeps it open. */
async function pointerAway(trigger: HTMLElement): Promise<void> {
  const rect = trigger.getBoundingClientRect();
  fireEvent.pointerLeave(trigger, {
    pointerType: 'mouse',
    clientX: rect.left - 1,
    clientY: rect.top - 1,
  });
  fireEvent.pointerMove(document, { clientX: rect.left - 300, clientY: rect.top - 300 });
  await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument(), {
    timeout: 2000,
  });
}

async function hoverOpen(trigger: HTMLElement): Promise<void> {
  fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
  await waitFor(() => expect(trigger).toHaveAttribute('data-open'));
}

describe('NgpMenu opened on hover', () => {
  it('leaves focus where it was when the pointer moves away', async () => {
    await render(HoverMenuComponent);
    const before = screen.getByTestId('before');
    before.focus();
    const trigger = screen.getByTestId('trigger');

    await hoverOpen(trigger);
    await pointerAway(trigger);

    expect(before).toHaveFocus();
  });

  it('does not focus the trigger when nothing had focus before the hover', async () => {
    await render(HoverMenuComponent);
    (document.activeElement as HTMLElement | null)?.blur();
    const trigger = screen.getByTestId('trigger');

    await hoverOpen(trigger);
    await pointerAway(trigger);

    expect(trigger).not.toHaveFocus();
    expect(document.activeElement).toBe(document.body);
  });

  it('leaves focus where it was across a trigger group handoff', async () => {
    await render(HoverGroupComponent);
    const before = screen.getByTestId('before');
    before.focus();
    const first = screen.getByTestId('first');
    const second = screen.getByTestId('second');

    await hoverOpen(first);
    fireEvent.pointerLeave(first, { pointerType: 'mouse' });
    await hoverOpen(second);
    await pointerAway(second);

    expect(before).toHaveFocus();
  });
});
