import { Component, TemplateRef, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Real (unmocked) CSS layout - explicit sizes on trigger-a/trigger-b so their
 * relative positions are deterministic, and a wide ngpSubmenuTriggerOffset on
 * trigger-a so the corridor toward submenu-a genuinely spans trigger-b's
 * column, the way a real vertical nav's diagonal-to-submenu path does. Real
 * getBoundingClientRect is read from these after render rather than any
 * hardcoded pixel guesses.
 */
@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div
        ngpMenu
        data-testid="root-menu"
        style="display: flex; flex-direction: column; position: relative;"
      >
        <button
          [ngpSubmenuTrigger]="submenuA"
          [ngpSubmenuTriggerOffset]="60"
          ngpMenuItem
          data-testid="trigger-a"
          style="width: 100px; height: 32px; padding: 0; margin: 0;"
        >
          Trigger A
        </button>
        <button
          [ngpSubmenuTrigger]="submenuB"
          ngpMenuItem
          data-testid="trigger-b"
          style="width: 100px; height: 32px; padding: 0; margin: 0;"
        >
          Trigger B
        </button>
      </div>
    </ng-template>

    <ng-template #submenuA>
      <div ngpMenu data-testid="submenu-a" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="submenu-a-item-1">A Item 1</button>
      </div>
    </ng-template>

    <ng-template #submenuB>
      <div ngpMenu data-testid="submenu-b" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="submenu-b-item-1">B Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class SiblingSubmenuTriggersComponent {
  readonly menu = viewChild<TemplateRef<unknown>>('menu');
  readonly submenuA = viewChild<TemplateRef<unknown>>('submenuA');
  readonly submenuB = viewChild<TemplateRef<unknown>>('submenuB');
}

async function openRootMenu(): Promise<HTMLElement> {
  const { fixture } = await render(SiblingSubmenuTriggersComponent);
  const rootTrigger = fixture.debugElement.nativeElement.querySelector(
    '[data-testid="root-trigger"]',
  ) as HTMLElement;

  await userEvent.click(rootTrigger);
  await waitFor(() =>
    expect(document.querySelector('[data-testid="trigger-a"]')).toBeInTheDocument(),
  );

  return document.querySelector('[data-testid="trigger-a"]') as HTMLElement;
}

/**
 * userEvent.pointer's own leave/enter bookkeeping (it gates dispatch on a
 * cached, per-call pointer-events check) doesn't reliably reflect a
 * suppression change applied mid-gesture in this environment. Corridor
 * movement is dispatched directly instead, the same technique the existing
 * hover-bridge geometry tests use, with the target resolved via a live
 * document.elementFromPoint call right before each dispatch - still real
 * Chromium, real CSS, real hit-testing, just without userEvent's own
 * target-tracking state machine in the way.
 */
function leavePointerAt(element: HTMLElement, coords: { x: number; y: number }): void {
  fireEvent.pointerLeave(element, { clientX: coords.x, clientY: coords.y, pointerType: 'mouse' });
}

function movePointerTo(coords: { x: number; y: number }): Element {
  const target = document.elementFromPoint(coords.x, coords.y) ?? document.body;
  fireEvent.pointerEnter(target, { clientX: coords.x, clientY: coords.y, pointerType: 'mouse' });
  fireEvent.pointerMove(document, { clientX: coords.x, clientY: coords.y, pointerType: 'mouse' });
  return target;
}

describe('NgpSubmenuTrigger sibling suppression - real layout, real pointer movement', () => {
  afterEach(() => {
    document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
  });

  it('does not open a sibling submenu-trigger while the pointer transits validly toward the open submenu', async () => {
    const triggerA = await openRootMenu();
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-a"]')).toBeInTheDocument(),
    );

    const submenuA = document.querySelector('[data-testid="submenu-a"]') as HTMLElement;
    const rectA = triggerA.getBoundingClientRect();
    const rectB = triggerB.getBoundingClientRect();
    const rectSubmenuA = submenuA.getBoundingClientRect();

    // A straight path from just below trigger-a's exit point through trigger-b's
    // row and on into submenu-a. Each waypoint's real hit-test target is
    // resolved fresh before dispatching it.
    leavePointerAt(triggerA, { x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 50, y: rectB.top + rectB.height / 2 });
    movePointerTo({ x: rectSubmenuA.left + 10, y: rectSubmenuA.bottom - 10 });

    expect(document.querySelector('[data-testid="submenu-b"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-testid="submenu-a"]')).toBeInTheDocument();
  });

  it('leaves the crossed sibling row itself inert while the corridor is active (real elementFromPoint hit-test)', async () => {
    const triggerA = await openRootMenu();
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-a"]')).toBeInTheDocument(),
    );

    const rectA = triggerA.getBoundingClientRect();
    const rectB = triggerB.getBoundingClientRect();
    const crossPoint = { x: rectA.left + 10, y: rectB.top + 2 };

    // Force the leave off trigger-a with the real exit coordinates - this is
    // what engages suppression. Checked with a fresh, independent query right
    // after: real hit-testing at crossPoint must not resolve to trigger-b, or
    // the browser would have delivered a real pointerenter to it regardless of
    // anything our own JS state believes.
    leavePointerAt(triggerA, crossPoint);
    fireEvent.pointerMove(document, { clientX: crossPoint.x, clientY: crossPoint.y });

    expect(document.elementFromPoint(crossPoint.x, crossPoint.y)).not.toBe(triggerB);
  });

  it('opens the sibling submenu-trigger normally once the corridor is abandoned', async () => {
    const triggerA = await openRootMenu();
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-a"]')).toBeInTheDocument(),
    );

    const rectB = triggerB.getBoundingClientRect();
    const farPoint = { x: rectB.left, y: rectB.bottom + 400 };

    // Move well clear of the corridor entirely, closing submenu-a - protection
    // must not linger once the corridor itself is gone.
    leavePointerAt(triggerA, farPoint);
    movePointerTo(farPoint);
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-a"]')).not.toBeInTheDocument(),
    );

    await userEvent.pointer({ target: triggerB, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-b"]')).toBeInTheDocument(),
    );
  });

  it('does not suppress the open submenu panel itself, only the sibling row', async () => {
    const triggerA = await openRootMenu();
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-a"]')).toBeInTheDocument(),
    );

    const submenuA = document.querySelector('[data-testid="submenu-a"]') as HTMLElement;
    const rectA = triggerA.getBoundingClientRect();
    const rectB = triggerB.getBoundingClientRect();
    const rectSubmenuA = submenuA.getBoundingClientRect();

    leavePointerAt(triggerA, { x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectA.left + 10, y: rectB.top + 2 });
    movePointerTo({ x: rectSubmenuA.left + 10, y: rectSubmenuA.bottom - 10 });

    // The panel we're actually heading into must remain fully interactive -
    // it's a separate overlay subtree from the sibling container, so it must
    // never be caught by the suppression applied to the trigger list.
    const submenuAItem1 = document.querySelector('[data-testid="submenu-a-item-1"]') as HTMLElement;
    await userEvent.pointer({ target: submenuAItem1 });
    expect(document.querySelector('[data-testid="submenu-a"]')).toBeInTheDocument();
  });
});
