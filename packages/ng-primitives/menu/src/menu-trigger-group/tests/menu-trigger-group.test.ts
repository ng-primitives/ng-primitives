import { Component, TemplateRef, viewChild } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpMenuTriggerGroup } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { leavePointerAt, movePointerTo } from '../../tests/hover-bridge-pointer.fixture';

/**
 * Root-level equivalent of menu-hover-bridge-sibling-triggers.test.ts: a
 * vertical list of root NgpMenuTrigger siblings (a vertical nav) wrapped in
 * NgpMenuTriggerGroup, each opening a panel to the right on hover. Real
 * (unmocked) layout, same reasoning as the submenu-trigger fixture for why
 * the corridor's x-domain naturally spans the sibling column.
 */
@Component({
  template: `
    <div
      ngpMenuTriggerGroup
      data-testid="trigger-group"
      style="display: flex; flex-direction: column; position: relative;"
    >
      <button
        [ngpMenuTrigger]="menuA"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        [ngpMenuTriggerPlacement]="'right-start'"
        [ngpMenuTriggerOffset]="60"
        data-testid="trigger-a"
        style="width: 100px; height: 32px; padding: 0; margin: 0;"
      >
        Trigger A
      </button>
      <button
        [ngpMenuTrigger]="menuB"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        [ngpMenuTriggerPlacement]="'right-start'"
        data-testid="trigger-b"
        style="width: 100px; height: 32px; padding: 0; margin: 0;"
      >
        Trigger B
      </button>
    </div>

    <ng-template #menuA>
      <div ngpMenu data-testid="menu-a" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="menu-a-item-1">A Item 1</button>
      </div>
    </ng-template>

    <ng-template #menuB>
      <div ngpMenu data-testid="menu-b" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="menu-b-item-1">B Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpMenuTriggerGroup],
})
class GroupedRootTriggersComponent {
  readonly menuA = viewChild<TemplateRef<unknown>>('menuA');
  readonly menuB = viewChild<TemplateRef<unknown>>('menuB');
}

/** Same fixture with no wrapping NgpMenuTriggerGroup - the fix is opt-in. */
@Component({
  template: `
    <div
      data-testid="trigger-group"
      style="display: flex; flex-direction: column; position: relative;"
    >
      <button
        [ngpMenuTrigger]="menuA"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        [ngpMenuTriggerPlacement]="'right-start'"
        [ngpMenuTriggerOffset]="60"
        data-testid="trigger-a"
        style="width: 100px; height: 32px; padding: 0; margin: 0;"
      >
        Trigger A
      </button>
      <button
        [ngpMenuTrigger]="menuB"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        [ngpMenuTriggerPlacement]="'right-start'"
        data-testid="trigger-b"
        style="width: 100px; height: 32px; padding: 0; margin: 0;"
      >
        Trigger B
      </button>
    </div>

    <ng-template #menuA>
      <div ngpMenu data-testid="menu-a" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="menu-a-item-1">A Item 1</button>
      </div>
    </ng-template>

    <ng-template #menuB>
      <div ngpMenu data-testid="menu-b" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="menu-b-item-1">B Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class UngroupedRootTriggersComponent {}

describe('NgpMenuTriggerGroup sibling suppression - real layout, real pointer movement', () => {
  afterEach(() => {
    document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
  });

  it('does not open a sibling root trigger while the pointer transits validly toward the open menu', async () => {
    await render(GroupedRootTriggersComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const menuA = document.querySelector('[data-testid="menu-a"]') as HTMLElement;
    const rectA = triggerA.getBoundingClientRect();
    const rectB = triggerB.getBoundingClientRect();
    const rectMenuA = menuA.getBoundingClientRect();

    leavePointerAt(triggerA, { x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 50, y: rectB.top + rectB.height / 2 });
    movePointerTo({ x: rectMenuA.left + 10, y: rectMenuA.bottom - 10 });

    expect(document.querySelector('[data-testid="menu-b"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument();
  });

  it('opens the sibling root trigger normally once the corridor is abandoned', async () => {
    await render(GroupedRootTriggersComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const rectB = triggerB.getBoundingClientRect();
    const farPoint = { x: rectB.left, y: rectB.bottom + 400 };

    // A large positive offset stays on-screen (a negative one can clamp to the
    // viewport edge in a real browser and land back inside the corridor).
    leavePointerAt(triggerA, farPoint);
    movePointerTo(farPoint);
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).not.toBeInTheDocument(),
    );

    await userEvent.pointer({ target: triggerB, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-b"]')).toBeInTheDocument(),
    );
  });

  it('does not suppress the open menu panel itself, only the sibling row', async () => {
    await render(GroupedRootTriggersComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const menuA = document.querySelector('[data-testid="menu-a"]') as HTMLElement;
    const rectA = triggerA.getBoundingClientRect();
    const rectB = triggerB.getBoundingClientRect();
    const rectMenuA = menuA.getBoundingClientRect();

    leavePointerAt(triggerA, { x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectMenuA.left + 10, y: rectMenuA.bottom - 10 });

    const menuAItem1 = document.querySelector('[data-testid="menu-a-item-1"]') as HTMLElement;
    await userEvent.pointer({ target: menuAItem1 });
    expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument();
  });

  it('keeps the open trigger itself hit-testable, so returning to it does not close the menu', async () => {
    await render(GroupedRootTriggersComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const rectA = triggerA.getBoundingClientRect();
    const exitPoint = { x: rectA.right + 2, y: rectA.bottom + 2 };
    const backOnTrigger = { x: rectA.left + 10, y: rectA.top + 10 };

    // Leave the trigger to engage suppression, then come straight back onto it.
    leavePointerAt(triggerA, exitPoint);
    movePointerTo(exitPoint);

    // The corridor is latched, so the trigger must still hit-test to itself -
    // otherwise its pointerenter never arrives and the move back reads as
    // leaving the corridor, closing the menu the pointer is sitting on.
    expect(document.elementFromPoint(backOnTrigger.x, backOnTrigger.y)).toBe(triggerA);

    movePointerTo(backOnTrigger);
    expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument();
  });

  it('lets a press reach the exempted trigger, which sits inside the inert container', async () => {
    await render(GroupedRootTriggersComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const rectA = triggerA.getBoundingClientRect();
    const exitPoint = { x: rectA.right + 2, y: rectA.bottom + 2 };
    const onTrigger = { clientX: rectA.left + 10, clientY: rectA.top + 10 };

    leavePointerAt(triggerA, exitPoint);
    movePointerTo(exitPoint);

    const clicks: Event[] = [];
    triggerA.addEventListener('click', event => clicks.push(event));

    // The trigger's coordinates fall inside the suppressed container, so the
    // press guards must exempt it too - hit-testing alone isn't enough.
    const press = new PointerEvent('pointerdown', {
      ...onTrigger,
      cancelable: true,
      bubbles: true,
    });
    triggerA.dispatchEvent(press);
    triggerA.dispatchEvent(
      new MouseEvent('click', { ...onTrigger, cancelable: true, bubbles: true }),
    );

    expect(press.defaultPrevented).toBe(false);
    expect(clicks).toHaveLength(1);
  });

  it('documents scope: without a wrapping NgpMenuTriggerGroup, a sibling still opens mid-transit', async () => {
    await render(UngroupedRootTriggersComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const rectA = triggerA.getBoundingClientRect();
    const rectB = triggerB.getBoundingClientRect();

    leavePointerAt(triggerA, { x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 50, y: rectB.top + rectB.height / 2 });

    // No group wraps these triggers, so this is a documented gap, not a
    // regression: the fix is opt-in and a lone/ungrouped trigger is a no-op.
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-b"]')).toBeInTheDocument(),
    );
  });
});
