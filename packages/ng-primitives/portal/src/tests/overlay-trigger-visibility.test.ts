import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { describe, expect, it } from 'vitest';

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

describe('overlay trigger visibility', () => {
  it('should keep the overlay open when the trigger measures zero as it opens', async () => {
    const { getByTestId } = await render(EmptyInlineTriggerComponent);

    fireEvent.click(getByTestId('trigger'));
    await waitFor(() => expect(popoverElement()).toBeInTheDocument());

    // Long enough for the initial measurement and the observer's first callback
    // to have been delivered and acted on.
    await new Promise(resolve => setTimeout(resolve, 100));

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

/** The overlay renders into a portal on `body`, outside the test container. */
function popoverElement(): HTMLElement | null {
  return document.querySelector('[ngpPopover]');
}
