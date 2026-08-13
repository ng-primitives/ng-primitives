import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

/**
 * The anchor sits well above and to the left of the trigger, so the two are
 * separable on both axes. `menuRect.top >= anchorRect.bottom` holds either way
 * and only checks the placement is below - it is the left-edge alignment and
 * `menuRect.top < triggerRect.top` that say which element was followed.
 */
@Component({
  template: `
    <div
      #anchor
      data-testid="anchor"
      style="position: absolute; top: 100px; left: 200px; width: 50px; height: 30px;"
    >
      Anchor Element
    </div>
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerAnchor]="useAnchor ? anchor : null"
      data-testid="trigger"
      style="position: absolute; top: 300px; left: 400px;"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: absolute; width: 120px;">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class AnchoredMenuComponent {
  useAnchor = true;
}

/**
 * Two anchors at different heights, so which one the menu followed is decided on
 * the vertical axis alone. `anchor` selects between them, or unsets the anchor.
 */
@Component({
  template: `
    <div
      #anchorA
      data-testid="anchor-a"
      style="position: absolute; top: 100px; left: 200px; width: 50px; height: 30px;"
    >
      Anchor A
    </div>
    <div
      #anchorB
      data-testid="anchor-b"
      style="position: absolute; top: 260px; left: 200px; width: 50px; height: 30px;"
    >
      Anchor B
    </div>
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerAnchor]="anchor === 'a' ? anchorA : anchor === 'b' ? anchorB : null"
      data-testid="trigger"
      style="position: absolute; top: 400px; left: 400px;"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="position: absolute; width: 120px;">
        <button ngpMenuItem>Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MovingAnchorMenuComponent {
  anchor: 'a' | 'b' | null = 'a';
}

describe('Menu moving anchor', () => {
  it('should move an open menu to the new anchor', async () => {
    const { fixture, getByTestId } = await renderMovingMenu();
    await openMenu(getByTestId('trigger'));
    expectAnchoredTo(getByTestId('anchor-a'), getByTestId('anchor-b'));

    await repoint(fixture, 'b');

    // The menu moved without closing.
    expect(getByTestId('trigger')).toHaveAttribute('data-open');
    expectAnchoredTo(getByTestId('anchor-b'), getByTestId('anchor-a'));
  });

  it('should treat the new anchor as inside once it is bound', async () => {
    const { fixture, getByTestId } = await renderMovingMenu();
    await openMenu(getByTestId('trigger'));
    await repoint(fixture, 'b');

    fireEvent.mouseUp(getByTestId('anchor-b'));
    await settle();

    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
    expect(getByTestId('trigger')).toHaveAttribute('data-open');
  });

  it('should treat the previous anchor as outside once the anchor moves', async () => {
    const { fixture, getByTestId } = await renderMovingMenu();
    await openMenu(getByTestId('trigger'));

    // Inside while it is the anchor...
    fireEvent.mouseUp(getByTestId('anchor-a'));
    await settle();
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();

    // ...and outside once the anchor has moved on, so exactly one element is
    // inside at a time and re-clicking the old one dismisses.
    await repoint(fixture, 'b');
    fireEvent.mouseUp(getByTestId('anchor-a'));
    await settle();

    expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
    expect(getByTestId('trigger')).not.toHaveAttribute('data-open');
  });

  it('should fall back to the trigger when the anchor is unset while open', async () => {
    const { fixture, getByTestId } = await renderMovingMenu();
    await openMenu(getByTestId('trigger'));

    await repoint(fixture, null);

    const menuRect = menuElement().getBoundingClientRect();
    const triggerRect = getByTestId('trigger').getBoundingClientRect();
    expect(menuRect.top).toBeGreaterThanOrEqual(triggerRect.bottom);
  });
});

describe('Menu anchor element', () => {
  it('should position the menu against the anchor element when provided', async () => {
    const { getByTestId } = await renderMenu(true);
    await openMenu(getByTestId('trigger'));

    const menuRect = menuElement().getBoundingClientRect();
    const anchorRect = getByTestId('anchor').getBoundingClientRect();
    const triggerRect = getByTestId('trigger').getBoundingClientRect();

    // bottom-start places the menu just below its positioning reference and
    // aligns their left edges.
    expect(menuRect.top).toBeGreaterThanOrEqual(anchorRect.bottom);
    expect(menuRect.left).toBeCloseTo(anchorRect.left, 0);

    // It is the anchor, not the trigger, that the menu followed.
    expect(menuRect.top).toBeLessThan(triggerRect.top);
  });

  it('should fall back to the trigger element when the anchor is null', async () => {
    const { getByTestId } = await renderMenu(false);
    await openMenu(getByTestId('trigger'));

    const menuRect = menuElement().getBoundingClientRect();
    const triggerRect = getByTestId('trigger').getBoundingClientRect();

    expect(menuRect.top).toBeGreaterThanOrEqual(triggerRect.bottom);
  });

  it('should not dismiss the menu when the anchor element is clicked', async () => {
    const { getByTestId } = await renderMenu(true);
    const trigger = getByTestId('trigger');
    await openMenu(trigger);

    // The anchor is not the trigger, so unless the overlay registry treats it
    // as inside, this counts as an outside press and dismisses the menu.
    fireEvent.mouseUp(getByTestId('anchor'));
    await settle();

    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-open');
  });

  it('should still dismiss the menu when an unrelated element is clicked', async () => {
    const { getByTestId } = await renderMenu(true);
    const trigger = getByTestId('trigger');
    await openMenu(trigger);

    fireEvent.mouseUp(document.body);
    await settle();

    expect(document.querySelector('[data-testid="menu"]')).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('data-open');
  });
});

async function renderMovingMenu() {
  const result = await render(MovingAnchorMenuComponent);
  result.fixture.autoDetectChanges(true);
  return result;
}

/**
 * Rebind the anchor and wait for floating-ui to settle on a new position.
 */
async function repoint(
  fixture: { componentInstance: MovingAnchorMenuComponent; detectChanges: () => void },
  anchor: 'a' | 'b' | null,
): Promise<void> {
  const before = menuElement().getBoundingClientRect().top;

  fixture.componentInstance.anchor = anchor;
  fixture.detectChanges();

  await waitFor(() => {
    TestBed.flushEffects();
    expect(menuElement().getBoundingClientRect().top).not.toBeCloseTo(before, 0);
  });
}

/**
 * bottom-start puts the menu just below its reference. Asserting against both
 * candidates keeps this honest - "close to A" alone would also hold if the menu
 * had never moved and A happened to be nearby.
 */
function expectAnchoredTo(anchor: HTMLElement, other: HTMLElement): void {
  const menuTop = menuElement().getBoundingClientRect().top;
  const tolerance = 12;

  expect(menuTop - anchor.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(0);
  expect(menuTop - anchor.getBoundingClientRect().bottom).toBeLessThan(tolerance);
  expect(Math.abs(menuTop - other.getBoundingClientRect().bottom)).toBeGreaterThan(tolerance);
}

async function renderMenu(useAnchor: boolean) {
  const result = await render(AnchoredMenuComponent);
  result.fixture.componentInstance.useAnchor = useAnchor;
  result.fixture.autoDetectChanges(true);
  return result;
}

/**
 * Waits for data-placement, which is only set once Floating UI has resolved a
 * position - before that the menu is in the DOM but still sitting at 0,0.
 */
async function openMenu(trigger: HTMLElement): Promise<void> {
  fireEvent.click(trigger);

  await waitFor(() => {
    TestBed.flushEffects();
    expect(menuElement()).toBeInTheDocument();
    expect(menuElement()).toHaveAttribute('data-placement');
  });
}

/**
 * Outside-press dismissal is not observable by waiting for it to happen, so the
 * two dismissal tests share a fixed settle instead. The dismissing case uses the
 * same settle, which is what keeps the non-dismissing assertions honest rather
 * than merely early.
 */
async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  TestBed.flushEffects();
}

function menuElement(): HTMLElement {
  return document.querySelector('[data-testid="menu"]') as HTMLElement;
}
