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
