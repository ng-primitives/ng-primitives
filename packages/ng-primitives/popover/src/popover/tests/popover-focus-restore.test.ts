import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <button #trigger="ngpPopoverTrigger" [ngpPopoverTrigger]="content" data-testid="trigger">
      Open
    </button>
    <input data-testid="outside-input" />
    <div style="height: 40px" data-testid="empty"></div>

    <ng-template #content>
      <div ngpPopover data-testid="popover">
        <button (click)="trigger.hide()" data-testid="close">Close</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverFocusComponent {}

@Component({
  template: `
    <button #outerTrigger="ngpPopoverTrigger" [ngpPopoverTrigger]="outer" data-testid="trigger">
      Open
    </button>
    <div style="height: 40px" data-testid="empty"></div>

    <ng-template #outer>
      <div ngpPopover data-testid="outer">
        <button [ngpPopoverTrigger]="inner" data-testid="inner-trigger">Open inner</button>
      </div>
    </ng-template>
    <ng-template #inner>
      <div ngpPopover data-testid="inner">
        <button (click)="outerTrigger.hide()" data-testid="inner-button">Close all</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class NestedPopoverFocusComponent {}

@Component({
  template: `
    <button [ngpPopoverTrigger]="showContent() ? content : undefined" data-testid="trigger">
      Open
    </button>

    <ng-template #content>
      <div ngpPopover data-testid="popover">
        <button data-testid="inside">Inside</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class ClearedContentComponent {
  readonly showContent = signal(true);
}

async function open() {
  await render(PopoverFocusComponent);
  const trigger = screen.getByTestId('trigger');
  await userEvent.click(trigger);
  await waitFor(() => expect(screen.getByTestId('popover')).toBeInTheDocument());
  await waitFor(() => expect(screen.getByTestId('close')).toHaveFocus());
  return trigger;
}

async function closed() {
  await waitFor(() => expect(screen.queryByTestId('popover')).not.toBeInTheDocument());
}

describe('NgpPopover focus on close', () => {
  it('returns focus to the root trigger when an outside click closes a nested popover tree', async () => {
    await render(NestedPopoverFocusComponent);
    const trigger = screen.getByTestId('trigger');

    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByTestId('inner-trigger')).toHaveFocus());
    await userEvent.click(screen.getByTestId('inner-trigger'));
    await waitFor(() => expect(screen.getByTestId('inner-button')).toHaveFocus());

    await userEvent.click(screen.getByTestId('empty'));
    await waitFor(() => expect(screen.queryByTestId('outer')).not.toBeInTheDocument());
    expect(screen.queryByTestId('inner')).not.toBeInTheDocument();

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the root trigger when the tree closes with focus in a nested popover', async () => {
    await render(NestedPopoverFocusComponent);
    const trigger = screen.getByTestId('trigger');

    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByTestId('inner-trigger')).toHaveFocus());
    await userEvent.click(screen.getByTestId('inner-trigger'));
    await waitFor(() => expect(screen.getByTestId('inner-button')).toHaveFocus());

    // closes the root from inside the nested popover, so focus is still in it
    await userEvent.click(screen.getByTestId('inner-button'));
    await waitFor(() => expect(screen.queryByTestId('outer')).not.toBeInTheDocument());

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger on Escape', async () => {
    const trigger = await open();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger when a close button inside it is clicked', async () => {
    const trigger = await open();

    await userEvent.click(screen.getByTestId('close'));
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
    await render(PopoverFocusComponent);
    const trigger = screen.getByTestId('trigger');
    (document.activeElement as HTMLElement | null)?.blur();

    // a synthetic click moves no focus, like a button click in Safari
    fireEvent.click(trigger, { detail: 1 });
    await waitFor(() => expect(screen.getByTestId('close')).toHaveFocus());

    await userEvent.click(screen.getByTestId('empty'));
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('moves focus to a control whose shadow content the outside click landed on', async () => {
    const trigger = await open();
    const host = document.body.appendChild(document.createElement('div'));
    host.tabIndex = 0;
    const label = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('span'));
    label.textContent = 'Shadow control';

    try {
      // synthetic events move no focus, so the overlay has to find the control itself
      const init = { bubbles: true, composed: true };
      label.dispatchEvent(new PointerEvent('pointerdown', init));
      label.dispatchEvent(new MouseEvent('mouseup', init));
      label.dispatchEvent(new MouseEvent('click', init));
      await closed();

      expect(host).toHaveFocus();
      expect(trigger).not.toHaveFocus();
    } finally {
      host.remove();
    }
  });

  it('moves focus to the shadow button a slotted label belongs to, not an outer host', async () => {
    await open();
    const outer = document.body.appendChild(document.createElement('div'));
    outer.tabIndex = 0;
    const host = outer.appendChild(document.createElement('div'));
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button><slot></slot></button>';
    const label = host.appendChild(document.createElement('span'));
    label.textContent = 'Slotted label';

    try {
      const init = { bubbles: true, composed: true };
      label.dispatchEvent(new PointerEvent('pointerdown', init));
      label.dispatchEvent(new MouseEvent('mouseup', init));
      label.dispatchEvent(new MouseEvent('click', init));
      await closed();

      expect(shadow.activeElement).toBe(shadow.querySelector('button'));
    } finally {
      outer.remove();
    }
  });

  it('returns focus to the trigger after a press on the page root', async () => {
    const trigger = await open();
    const init = { bubbles: true, composed: true };
    const root = document.documentElement;

    root.dispatchEvent(new PointerEvent('pointerdown', init));
    root.dispatchEvent(new MouseEvent('mouseup', init));
    root.dispatchEvent(new MouseEvent('click', init));
    await closed();

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger when the content is cleared while it holds focus', async () => {
    const { fixture } = await render(ClearedContentComponent);
    const trigger = screen.getByTestId('trigger');
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByTestId('inside')).toHaveFocus());

    fixture.componentInstance.showContent.set(false);
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
