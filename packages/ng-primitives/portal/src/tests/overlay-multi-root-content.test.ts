import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * `hide()` strips `data-instant` from the portal's root nodes before scheduling the
 * dispose timeout, so a non-element root node throws there and the overlay is never
 * disposed — it stays open forever.
 */
@Component({
  template: `
    <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>

    <ng-template #content>
      <div ngpPopover data-testid="popover">Popover content</div>

      <!-- A second root node, which Angular renders as a comment. -->
      <ng-template #nested><span>Nested</span></ng-template>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class MultiRootContentComponent {}

describe('overlay with multi-root content', () => {
  afterEach(() => {
    // The overlay portals onto `body`, so a failure would leak it into the next test.
    document.querySelectorAll('[ngpPopover]').forEach(element => element.remove());
  });

  it('should close an overlay whose content template has a non-element root node', async () => {
    const { getByTestId } = await render(MultiRootContentComponent);
    const trigger = getByTestId('trigger');

    fireEvent.click(trigger);
    await waitFor(() => expect(document.querySelector('[data-testid="popover"]')).not.toBeNull());

    fireEvent.click(trigger);

    await waitFor(() => expect(document.querySelector('[data-testid="popover"]')).toBeNull());
  });
});
