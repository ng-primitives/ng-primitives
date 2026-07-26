import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpFlip, NgpShift } from 'ng-primitives/portal';
import { describe, expect, it } from 'vitest';

const OFFSET = 4;

/**
 * The panel styles are inline rather than in a `styles` block: the menu is portalled out of
 * the component, so component-scoped styles don't reach it and the panel would stay static.
 *
 * The fixtures also pin `scrollBehavior` to `reposition`. The menu default is `block`, which
 * sets `overflow-y: scroll` on `<html>` and so turns the document element into a clipping
 * ancestor - exactly the thing these tests measure.
 */

/**
 * Trigger pinned near the bottom of the viewport with a tall document below it, so the
 * placement that fits depends on which root boundary overflow is measured against.
 */
@Component({
  template: `
    <div style="height: 3000px"></div>
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerFlip]="flip()"
      ngpMenuTriggerPlacement="bottom-start"
      ngpMenuTriggerScrollBehavior="reposition"
      data-testid="trigger"
      style="position: fixed; top: calc(100vh - 32px); left: 20px; width: 120px; height: 24px"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: fixed; width: 160px; height: 96px">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class RootBoundaryComponent {
  readonly flip = signal<NgpFlip>(true);
}

/**
 * Trigger inside a box that leaves less room below it than the viewport does, so an
 * explicit `boundary` changes both the chosen placement and the reported available space.
 */
@Component({
  template: `
    <div class="box" style="position: fixed; top: 40px; left: 20px; width: 300px; height: 200px">
      <button
        [ngpMenuTrigger]="menu"
        [ngpMenuTriggerFlip]="flip()"
        [ngpMenuTriggerShift]="shift()"
        [ngpMenuTriggerOffset]="offset"
        ngpMenuTriggerPlacement="bottom-start"
        ngpMenuTriggerScrollBehavior="reposition"
        data-testid="trigger"
        style="margin-top: 120px; width: 120px; height: 24px"
      >
        Open Menu
      </button>
    </div>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: fixed; width: 160px; height: 96px">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class BoundaryComponent {
  readonly flip = signal<NgpFlip>(true);
  readonly shift = signal<NgpShift>(undefined);
  // Bound rather than left to the menu default, since the assertions below subtract it.
  readonly offset = OFFSET;
}

/**
 * `bottom-end` against the left edge, so the panel overflows on the alignment axis. Flip is
 * off so its own alignment flipping doesn't correct the overflow before shift sees it.
 */
@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerShift]="shift()"
      [ngpMenuTriggerFlip]="false"
      ngpMenuTriggerPlacement="bottom-end"
      ngpMenuTriggerScrollBehavior="reposition"
      data-testid="trigger"
      style="position: fixed; top: 100px; left: 0; width: 40px; height: 24px"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: fixed; width: 200px; height: 96px">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class ShiftComponent {
  readonly shift = signal<NgpShift>(undefined);
}

/**
 * The same overflow on the alignment axis, but with shift off so flip's own alignment
 * flipping is what does - or doesn't - correct it.
 */
@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerFlip]="flip()"
      [ngpMenuTriggerShift]="false"
      ngpMenuTriggerPlacement="bottom-end"
      ngpMenuTriggerScrollBehavior="reposition"
      data-testid="trigger"
      style="position: fixed; top: 100px; left: 0; width: 40px; height: 24px"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: fixed; width: 200px; height: 96px">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class FlipCrossAxisComponent {
  readonly flip = signal<NgpFlip>(true);
}

/**
 * `bottom` placement with the trigger near the bottom edge, so the panel overflows on the
 * side axis - the axis only shift's `crossAxis` moves along. Flip is off so it can't rescue
 * the placement first.
 */
@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerShift]="shift()"
      [ngpMenuTriggerFlip]="false"
      ngpMenuTriggerPlacement="bottom"
      ngpMenuTriggerScrollBehavior="reposition"
      data-testid="trigger"
      style="position: fixed; top: calc(100vh - 40px); left: 100px; width: 120px; height: 24px"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: fixed; width: 160px; height: 96px">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class ShiftCrossAxisComponent {
  readonly shift = signal<NgpShift>(undefined);
}

async function openMenu(fixture: {
  autoDetectChanges: (autoDetect: boolean) => void;
  debugElement: { nativeElement: HTMLElement };
}): Promise<HTMLElement> {
  fixture.autoDetectChanges(true);

  fireEvent.click(fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]')!);

  await waitFor(() => {
    TestBed.flushEffects();
    expect(document.querySelector('[data-testid="menu"]')).toHaveAttribute('data-placement');
  });

  return document.querySelector('[data-testid="menu"]') as HTMLElement;
}

function query(fixture: { debugElement: { nativeElement: HTMLElement } }, selector: string) {
  return fixture.debugElement.nativeElement.querySelector(selector) as HTMLElement;
}

/** The `--ngp-menu-available-height` custom property, as a number. */
function availableHeight(menu: HTMLElement): number {
  return parseFloat(menu.style.getPropertyValue('--ngp-menu-available-height'));
}

describe('overlay overflow boundary', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpMenu]').forEach(element => element.remove());
  });

  describe('flip', () => {
    it('should flip against the viewport by default', async () => {
      const { fixture } = await render(RootBoundaryComponent);

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'top-start');
    });

    it('should not flip when the root boundary is the document', async () => {
      const { fixture } = await render(RootBoundaryComponent, {
        componentProperties: { flip: signal<NgpFlip>({ rootBoundary: 'document' }) },
      });

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'bottom-start');
    });

    it('should not flip inside an element boundary that has room', async () => {
      const { fixture } = await render(BoundaryComponent);

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'bottom-start');
    });

    it('should flip when an element boundary runs out of room before the viewport does', async () => {
      const { fixture } = await render(BoundaryComponent);
      // The box ends 56px below the trigger - less than the panel needs - while the viewport
      // has far more room, so this only flips if the boundary reached Floating UI.
      fixture.componentInstance.flip.set({ boundary: query(fixture, '.box') });

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'top-start');
    });

    it('should flip the alignment on the cross axis by default', async () => {
      const { fixture } = await render(FlipCrossAxisComponent);

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'bottom-start');
    });

    it('should keep the alignment when the cross axis is disabled', async () => {
      const { fixture } = await render(FlipCrossAxisComponent, {
        componentProperties: { flip: signal<NgpFlip>({ crossAxis: false }) },
      });

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'bottom-end');
    });

    it('should still disable flipping when set to false', async () => {
      const { fixture } = await render(RootBoundaryComponent, {
        componentProperties: { flip: signal<NgpFlip>(false) },
      });

      expect(await openMenu(fixture)).toHaveAttribute('data-placement', 'bottom-start');
    });
  });

  describe('shift', () => {
    it('should shift the menu back into view by default', async () => {
      const { fixture } = await render(ShiftComponent);

      expect((await openMenu(fixture)).getBoundingClientRect().left).toBe(0);
    });

    it('should still disable shifting when set to false', async () => {
      const { fixture } = await render(ShiftComponent, {
        componentProperties: { shift: signal<NgpShift>(false) },
      });

      expect((await openMenu(fixture)).getBoundingClientRect().left).toBeLessThan(0);
    });

    it('should leave the side axis alone by default', async () => {
      const { fixture } = await render(ShiftCrossAxisComponent);

      expect((await openMenu(fixture)).getBoundingClientRect().bottom).toBeGreaterThan(
        window.innerHeight,
      );
    });

    it('should shift along the side axis when the cross axis is enabled', async () => {
      const { fixture } = await render(ShiftCrossAxisComponent, {
        componentProperties: { shift: signal<NgpShift>({ crossAxis: true }) },
      });

      expect((await openMenu(fixture)).getBoundingClientRect().bottom).toBeLessThanOrEqual(
        window.innerHeight,
      );
    });
  });

  // `size` reports how much room is left before the overlay overflows, so it has to measure
  // against the same boundary as flip/shift - otherwise `--ngp-*-available-height` describes
  // a different area than the one the overlay is being kept inside.
  describe('available space', () => {
    it('should measure against the viewport when no boundary is set', async () => {
      const { fixture } = await render(BoundaryComponent);

      const menu = await openMenu(fixture);

      const trigger = query(fixture, '[data-testid="trigger"]');
      expect(availableHeight(menu)).toBeCloseTo(
        window.innerHeight - trigger.getBoundingClientRect().bottom - OFFSET,
        0,
      );
    });

    it('should measure against a flip boundary', async () => {
      const { fixture } = await render(BoundaryComponent);
      const box = query(fixture, '.box');
      // No fallback placements, so the panel stays below and the reported height is the
      // space between the trigger and the bottom of the box.
      fixture.componentInstance.flip.set({ boundary: box, fallbackPlacements: [] });

      const menu = await openMenu(fixture);

      const trigger = query(fixture, '[data-testid="trigger"]');
      const expected =
        box.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom - OFFSET;
      expect(menu).toHaveAttribute('data-placement', 'bottom-start');
      expect(availableHeight(menu)).toBeCloseTo(expected, 0);
      expect(availableHeight(menu)).toBeLessThan(window.innerHeight);
    });

    // Flip is enabled by default and resolves to an empty options object, which must not
    // mask a boundary that only shift sets.
    it('should measure against a shift boundary when flip is left at its default', async () => {
      const { fixture } = await render(BoundaryComponent);
      const box = query(fixture, '.box');
      fixture.componentInstance.shift.set({ boundary: box });

      const menu = await openMenu(fixture);

      const trigger = query(fixture, '[data-testid="trigger"]');
      const expected =
        box.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom - OFFSET;
      expect(availableHeight(menu)).toBeCloseTo(expected, 0);
    });

    it('should measure against a shift boundary when flip is disabled', async () => {
      const { fixture } = await render(BoundaryComponent);
      const box = query(fixture, '.box');
      fixture.componentInstance.flip.set(false);
      fixture.componentInstance.shift.set({ boundary: box });

      const menu = await openMenu(fixture);

      const trigger = query(fixture, '[data-testid="trigger"]');
      const expected =
        box.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom - OFFSET;
      expect(availableHeight(menu)).toBeCloseTo(expected, 0);
    });
  });
});
