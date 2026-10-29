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

@Component({
  template: `
    <button [ngpMenuTrigger]="menuA" data-testid="trigger-a">A</button>
    <button [ngpMenuTrigger]="menuB" data-testid="trigger-b">B</button>

    <ng-template #menuA>
      <div ngpMenu data-testid="menu-a">
        <button ngpMenuItem>A item</button>
      </div>
    </ng-template>
    <ng-template #menuB>
      <div ngpMenu data-testid="menu-b">
        <button ngpMenuItem data-testid="b-item">B item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TwoMenusComponent {}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="['hover', 'click']"
      [ngpMenuTriggerShowDelay]="150"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item-2">Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class DelayedMenuComponent {}

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

  it('returns focus to a trigger clicked while another menu was open', async () => {
    await render(TwoMenusComponent);
    const triggerB = screen.getByTestId('trigger-b');

    await userEvent.click(screen.getByTestId('trigger-a'));
    await waitFor(() => expect(screen.getByTestId('menu-a')).toBeInTheDocument());

    await userEvent.click(triggerB);
    await waitFor(() => expect(screen.getByTestId('menu-b')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByTestId('menu-a')).not.toBeInTheDocument());

    await userEvent.click(screen.getByTestId('b-item'));
    await waitFor(() => expect(screen.queryByTestId('menu-b')).not.toBeInTheDocument());

    expect(triggerB).toHaveFocus();
  });

  it('keeps a trigger press that joins an open already scheduled by a hover', async () => {
    await render(DelayedMenuComponent);
    const trigger = screen.getByTestId('trigger');
    (document.activeElement as HTMLElement | null)?.blur();

    // the hover schedules the open behind the show delay, and the click joins it
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
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
