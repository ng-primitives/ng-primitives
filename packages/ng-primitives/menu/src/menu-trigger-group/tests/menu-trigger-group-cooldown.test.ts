import { Component, TemplateRef, viewChild } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpMenuTriggerGroup } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { leavePointerAt, movePointerTo } from '../../tests/hover-bridge-pointer.fixture';

/**
 * Grouped hover triggers, each opening a panel to the side. The corridor closes
 * the menu you are leaving before the one you are heading to opens, so the
 * outgoing panel is already playing its exit animation when its replacement
 * arrives - the ordering a same-type swap has to cope with.
 */
@Component({
  template: `
    <div
      ngpMenuTriggerGroup
      style="display: flex; flex-direction: column; gap: 4px; position: relative;"
    >
      <button
        [ngpMenuTrigger]="menuA"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        [ngpMenuTriggerCooldown]="cooldown"
        [ngpMenuTriggerPlacement]="'right-start'"
        data-testid="cooldown-trigger-a"
        style="height: 32px; padding: 0; margin: 0;"
      >
        Trigger A
      </button>
      <button
        [ngpMenuTrigger]="menuB"
        [ngpMenuTriggerOpenTriggers]="['hover']"
        [ngpMenuTriggerCooldown]="cooldown"
        [ngpMenuTriggerPlacement]="'right-start'"
        data-testid="cooldown-trigger-b"
        style="height: 32px; padding: 0; margin: 0;"
      >
        Trigger B
      </button>
    </div>

    <ng-template #menuA>
      <div ngpMenu data-testid="cooldown-menu-a" style="width: 140px; height: 80px;">
        <button ngpMenuItem>A Item 1</button>
      </div>
    </ng-template>

    <ng-template #menuB>
      <div ngpMenu data-testid="cooldown-menu-b" style="width: 140px; height: 80px;">
        <button ngpMenuItem>B Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpMenuTriggerGroup],
})
class CooldownGroupComponent {
  readonly menuA = viewChild<TemplateRef<unknown>>('menuA');
  readonly menuB = viewChild<TemplateRef<unknown>>('menuB');
  cooldown = 300;
}

/**
 * A CSS exit animation the test can hold open. This environment does not
 * materialise real CSS animations synchronously, so `getAnimations` is stubbed
 * the same way the exit-animation unit tests do it: the panel stays on screen
 * mid-exit until something ends the animation, which is exactly the window a
 * same-type swap lands in.
 */
function holdExitAnimationOpen(element: HTMLElement): void {
  const animation = {
    finished: new Promise<void>(() => undefined),
    cancel: () => undefined,
    finish: () => undefined,
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;

  element.getAnimations = () => [animation];
}

/** Open menu A and leave it mid-exit, with the pointer clear of the group. */
async function openThenExitMenuA(): Promise<void> {
  const triggerA = document.querySelector('[data-testid="cooldown-trigger-a"]') as HTMLElement;

  await userEvent.pointer({ target: triggerA, coords: { x: 10, y: 16 } });
  await waitFor(() =>
    expect(document.querySelector('[data-testid="cooldown-menu-a"]')).toBeInTheDocument(),
  );

  holdExitAnimationOpen(document.querySelector('[data-testid="cooldown-menu-a"]') as HTMLElement);

  const farPoint = { x: 5, y: 600 };
  leavePointerAt(triggerA, farPoint);
  movePointerTo(farPoint);

  await waitFor(() =>
    expect(document.querySelector('[data-testid="cooldown-menu-a"]')).toHaveAttribute('data-exit'),
  );
}

/** Hover trigger B, which opens its menu while menu A is still exiting. */
async function openMenuB(): Promise<void> {
  const triggerB = document.querySelector('[data-testid="cooldown-trigger-b"]') as HTMLElement;

  await userEvent.pointer({ target: triggerB, coords: { x: 10, y: 16 } });
  await waitFor(() =>
    expect(document.querySelector('[data-testid="cooldown-menu-b"]')).toBeInTheDocument(),
  );
}

/**
 * Every animation state the element passes through, in order. The documented
 * way to opt out of an instant transition is
 * `[data-instant][data-enter] { animation: none }`, so any state that still
 * carries `data-enter` after `data-instant` has gone re-arms the entrance
 * animation - the panel blinks back to its "from" frame before it exits.
 */
function recordAnimationStates(element: HTMLElement): string[] {
  const states: string[] = [];
  const snapshot = () =>
    ['data-enter', 'data-exit', 'data-instant']
      .filter(name => element.hasAttribute(name))
      .join(' ');

  states.push(snapshot());
  new MutationObserver(() => {
    const current = snapshot();
    if (current !== states[states.length - 1]) {
      states.push(current);
    }
  }).observe(element, { attributes: true });

  return states;
}

describe('NgpMenuTriggerGroup cooldown', () => {
  afterEach(() => {
    document.querySelectorAll('[data-overlay]').forEach(el => el.remove());
  });

  it('drops the exiting menu when its replacement opens within the cooldown', async () => {
    await render(CooldownGroupComponent);
    await openThenExitMenuA();
    await openMenuB();

    // The point of the cooldown: the swap reads as one movement, not as a panel
    // fading out behind the panel that replaced it.
    expect(document.querySelector('[data-testid="cooldown-menu-a"]')).not.toBeInTheDocument();
  });

  it('marks the incoming menu as an instant transition', async () => {
    await render(CooldownGroupComponent);
    await openThenExitMenuA();
    await openMenuB();

    expect(document.querySelector('[data-testid="cooldown-menu-b"]')).toHaveAttribute(
      'data-instant',
    );
  });

  it('keeps an instantly-shown menu instant until it is actually exiting', async () => {
    await render(CooldownGroupComponent);
    await openThenExitMenuA();
    await openMenuB();

    const menuB = document.querySelector('[data-testid="cooldown-menu-b"]') as HTMLElement;
    expect(menuB).toHaveAttribute('data-instant');
    const states = recordAnimationStates(menuB);

    // Leave the trigger without heading for the menu, so it closes normally.
    const triggerB = document.querySelector('[data-testid="cooldown-trigger-b"]') as HTMLElement;
    const farPoint = { x: 5, y: 600 };
    leavePointerAt(triggerB, farPoint);
    movePointerTo(farPoint);

    await waitFor(() => expect(menuB).toHaveAttribute('data-exit'));

    // The instant flag may only be dropped once the element is exiting. Losing
    // it a moment early re-arms the entrance animation, so the panel blinks
    // back to its opening frame and then fades out from full opacity.
    expect(
      states.filter(state => state.includes('data-enter') && !state.includes('data-instant')),
    ).toEqual([]);
  });

  it('leaves the exiting menu to finish when no cooldown is configured', async () => {
    // The menu default - opting out has to keep today's behaviour.
    await render(CooldownGroupComponent, { componentProperties: { cooldown: 0 } });
    await openThenExitMenuA();
    await openMenuB();

    expect(document.querySelector('[data-testid="cooldown-menu-a"]')).toBeInTheDocument();
  });
});
