import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { describe, expect, it } from 'vitest';

@Component({
  template: `
    <div data-testid="scroller" style="height: 200px; overflow: auto;">
      <div style="height: 100px;"></div>
      <button [ngpPopoverTrigger]="content" ngpPopoverTriggerPlacement="right">Open</button>
      <div style="height: 1000px;"></div>
    </div>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class ScrollContainerPopoverComponent {}

describe('NgpPopover data-reference-hidden', () => {
  it('flags the popover while its trigger is scrolled out of view', async () => {
    const { getByRole, getByTestId } = await render(ScrollContainerPopoverComponent);
    const scroller = getByTestId('scroller');

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(document.querySelector('[ngpPopover]')).toBeInTheDocument());
    const popover = document.querySelector('[ngpPopover]')!;
    await waitFor(() => expect(popover).toHaveAttribute('data-placement'));
    expect(popover).not.toHaveAttribute('data-reference-hidden');

    scroller.scrollTop = 600;
    await waitFor(() => expect(popover).toHaveAttribute('data-reference-hidden'));

    scroller.scrollTop = 0;
    await waitFor(() => expect(popover).not.toHaveAttribute('data-reference-hidden'));
  });
});
