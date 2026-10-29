import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open</button>
    <input data-testid="outside-input" />
    <div style="height: 40px" data-testid="empty"></div>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button ngpMenuItem data-testid="item-2">Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuFocusComponent {}

async function open() {
  await render(MenuFocusComponent);
  const trigger = screen.getByTestId('trigger');
  await userEvent.click(trigger);
  await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());
  return trigger;
}

async function closed() {
  await waitFor(() => expect(screen.queryByTestId('menu')).not.toBeInTheDocument());
}

describe('NgpMenu focus on close', () => {
  it('returns focus to the trigger after a mouse pick', async () => {
    const trigger = await open();

    await userEvent.click(screen.getByTestId('item-2'));
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger on Escape after a mouse open', async () => {
    const trigger = await open();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger on an outside click on empty space', async () => {
    const trigger = await open();

    await userEvent.click(screen.getByTestId('empty'));
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('returns focus to a clicked trigger the browser did not focus, as Safari does', async () => {
    await render(MenuFocusComponent);
    const trigger = screen.getByTestId('trigger');
    (document.activeElement as HTMLElement | null)?.blur();

    // a synthetic click moves no focus, like a button click in Safari
    fireEvent.click(trigger, { detail: 1 });
    await waitFor(() => expect(screen.getByTestId('menu')).toBeInTheDocument());

    await userEvent.click(screen.getByTestId('item-2'));
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('leaves focus on a control the outside click landed on', async () => {
    await open();
    const input = screen.getByTestId('outside-input');

    await userEvent.click(input);
    await closed();

    expect(input).toHaveFocus();
  });
});
