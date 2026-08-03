import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The overlay watches its trigger for resizes so it can close when the trigger is
 * hidden, rather than float beside something that is no longer there (#415).
 *
 * The distinction drawn here is between a *transition* to zero and a first
 * measurement of zero. A trigger can legitimately measure 0x0 as the overlay opens
 * — an empty inline element has no box until it has content — and closing on that
 * reading tears down an overlay that was only just opened.
 */
@Component({
  template: `
    <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class BlockTriggerComponent {}

@Component({
  template: `
    <span
      [ngpPopoverTrigger]="content"
      data-testid="trigger"
      style="display: inline; width: 0; height: 0;"
    ></span>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class EmptyInlineTriggerComponent {}

let restoreResizeObserver: (() => void) | undefined;

describe('overlay trigger visibility', () => {
  afterEach(() => {
    restoreResizeObserver?.();
    restoreResizeObserver = undefined;
  });

  it('should keep the overlay open when the trigger measures zero as it opens', async () => {
    // This assertion is that nothing happens, so it needs a point at which the events
    // that could have closed the overlay have demonstrably been delivered — otherwise
    // it passes just as well when neither measurement ever arrived. Wrapping the real
    // observer rather than replacing it keeps the measurement genuine.
    const observed = observeFirstDelivery();

    const { getByTestId } = await render(EmptyInlineTriggerComponent);

    fireEvent.click(getByTestId('trigger'));
    await waitFor(() => expect(popoverElement()).toBeInTheDocument());

    // The observer has reported the trigger's 0x0 size...
    await observed.firstDelivery;
    // ...and the deferred baseline, which reports 0x0 for it too, has flushed.
    await Promise.resolve();

    expect(popoverElement()).toBeInTheDocument();
  });

  it('should hide the overlay when the trigger element is hidden', async () => {
    const { getByTestId } = await render(BlockTriggerComponent);

    fireEvent.click(getByTestId('trigger'));
    await waitFor(() => expect(popoverElement()).toBeInTheDocument());

    getByTestId('trigger').style.display = 'none';

    await waitFor(() => expect(popoverElement()).not.toBeInTheDocument());
  });

  it('should hide the overlay when the trigger element collapses to zero size', async () => {
    const { getByTestId } = await render(BlockTriggerComponent);

    fireEvent.click(getByTestId('trigger'));
    await waitFor(() => expect(popoverElement()).toBeInTheDocument());

    const trigger = getByTestId('trigger');
    trigger.style.width = '0';
    trigger.style.height = '0';
    trigger.style.padding = '0';
    trigger.style.border = 'none';

    await waitFor(() => expect(popoverElement()).not.toBeInTheDocument());
  });
});

/**
 * Wraps the native `ResizeObserver` so a test can await its first delivery. The
 * observer still measures for real; only the notification is tapped.
 */
function observeFirstDelivery(): { firstDelivery: Promise<void> } {
  const Native = window.ResizeObserver;
  let delivered!: () => void;
  const firstDelivery = new Promise<void>(resolve => (delivered = resolve));

  window.ResizeObserver = class extends Native {
    constructor(callback: ResizeObserverCallback) {
      super((entries, observer) => {
        callback(entries, observer);
        delivered();
      });
    }
  };

  restoreResizeObserver = () => {
    window.ResizeObserver = Native;
  };

  return { firstDelivery };
}

/** The overlay renders into a portal on `body`, outside the test container. */
function popoverElement(): HTMLElement | null {
  return document.querySelector('[ngpPopover]');
}
