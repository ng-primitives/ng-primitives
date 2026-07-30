import { Component, TemplateRef, viewChild } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpMenuTriggerGroup,
  NgpSubmenuTrigger,
} from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { leavePointerAt, movePointerTo } from '../../tests/hover-bridge-pointer.fixture';

/**
 * Two nesting levels, each with its own sibling to protect: a root
 * NgpMenuTriggerGroup (trigger-a, trigger-b) and, inside menu-a, a nested pair
 * of NgpSubmenuTrigger siblings (nested-trigger-a1, nested-trigger-a2). Each
 * level's hover-bridge must suppress pointer-events only on ITS OWN sibling
 * container - the root group's container and menu-a's panel are different
 * elements, and a corridor at one level must never leave the other level's
 * container inert.
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
      <div
        ngpMenu
        data-testid="menu-a"
        style="display: flex; flex-direction: column; position: relative; width: 140px;"
      >
        <button
          [ngpSubmenuTrigger]="submenuA1"
          [ngpSubmenuTriggerOffset]="60"
          ngpMenuItem
          data-testid="nested-trigger-a1"
          style="width: 120px; height: 32px; padding: 0; margin: 0;"
        >
          Nested A1
        </button>
        <button
          [ngpSubmenuTrigger]="submenuA2"
          ngpMenuItem
          data-testid="nested-trigger-a2"
          style="width: 120px; height: 32px; padding: 0; margin: 0;"
        >
          Nested A2
        </button>
      </div>
    </ng-template>

    <ng-template #submenuA1>
      <div ngpMenu data-testid="submenu-a1" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="submenu-a1-item-1">A1 Item 1</button>
      </div>
    </ng-template>

    <ng-template #submenuA2>
      <div ngpMenu data-testid="submenu-a2" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="submenu-a2-item-1">A2 Item 1</button>
      </div>
    </ng-template>

    <ng-template #menuB>
      <div ngpMenu data-testid="menu-b" style="width: 140px; height: 80px;">
        <button ngpMenuItem data-testid="menu-b-item-1">B Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger, NgpMenuTriggerGroup],
})
class NestedIndependenceComponent {
  readonly menuA = viewChild<TemplateRef<unknown>>('menuA');
  readonly menuB = viewChild<TemplateRef<unknown>>('menuB');
  readonly submenuA1 = viewChild<TemplateRef<unknown>>('submenuA1');
  readonly submenuA2 = viewChild<TemplateRef<unknown>>('submenuA2');
}

describe('hover-bridge sibling suppression - independence across nesting levels', () => {
  afterEach(() => {
    document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
  });

  it('a nested corridor suppresses its own sibling without leaving the root group inert', async () => {
    await render(NestedIndependenceComponent);
    const triggerA = document.querySelector('[data-testid="trigger-a"]') as HTMLElement;
    const triggerB = document.querySelector('[data-testid="trigger-b"]') as HTMLElement;

    // Open menu-a from the root group, then arrive inside it (this clears the
    // root-level corridor - isPointerInAnchor becomes true - independently of
    // anything that happens at the nested level below).
    await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-a"]')).toBeInTheDocument(),
    );

    const nestedTriggerA1 = document.querySelector(
      '[data-testid="nested-trigger-a1"]',
    ) as HTMLElement;
    const nestedTriggerA2 = document.querySelector(
      '[data-testid="nested-trigger-a2"]',
    ) as HTMLElement;

    await userEvent.pointer({ target: nestedTriggerA1, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="submenu-a1"]')).toBeInTheDocument(),
    );

    const submenuA1 = document.querySelector('[data-testid="submenu-a1"]') as HTMLElement;
    const rectA1 = nestedTriggerA1.getBoundingClientRect();
    const rectA2 = nestedTriggerA2.getBoundingClientRect();
    const rectSubmenuA1 = submenuA1.getBoundingClientRect();

    // Transit the nested corridor, crossing nested-trigger-a2's row.
    leavePointerAt(nestedTriggerA1, { x: rectA1.left + 10, y: rectA2.top + 2 });
    movePointerTo({ x: rectA1.left + 10, y: rectA2.top + 2 });
    movePointerTo({ x: rectA1.left + 50, y: rectA2.top + rectA2.height / 2 });
    movePointerTo({ x: rectSubmenuA1.left + 10, y: rectSubmenuA1.bottom - 10 });

    // The nested sibling was suppressed, exactly like the single-level case.
    expect(document.querySelector('[data-testid="submenu-a2"]')).not.toBeInTheDocument();

    // But the ROOT group's container must be untouched by the nested corridor -
    // trigger-b lives in a different sibling container entirely, and hovering
    // it now must open menu-b as normal, proving nested-level suppression
    // didn't leak up and disable the root group too.
    await userEvent.pointer({ target: triggerB, coords: { x: 10, y: 16 } });
    await waitFor(() =>
      expect(document.querySelector('[data-testid="menu-b"]')).toBeInTheDocument(),
    );
  });
});
