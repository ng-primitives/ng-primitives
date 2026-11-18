import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * An `@if` at the root of the content template leaves a comment anchor among the
 * view's root nodes, so the overlay must not treat every root node as an element.
 */
@Component({
  template: `
    <button [ngpPopoverTrigger]="content" data-testid="trigger">Open</button>

    <ng-template #content>
      @if (true) {
        <div ngpPopover>Popover content</div>
      }
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverControlFlowRoot {}

@Component({
  template: `
    <button
      [ngpTooltipTrigger]="content"
      ngpTooltipTriggerShowDelay="0"
      ngpTooltipTriggerHideDelay="0"
      data-testid="trigger"
    >
      Hover
    </button>

    <ng-template #content>
      @if (true) {
        <div ngpTooltip>Tooltip content</div>
      }
    </ng-template>
  `,
  imports: [NgpTooltipTrigger, NgpTooltip],
})
class TooltipControlFlowRoot {}

describe('overlay with control flow at the root of its content', () => {
  afterEach(() => {
    // Overlays are portalled to the body, so a failure would leak into the next test.
    document.querySelectorAll('[ngpPopover], [ngpTooltip]').forEach(element => element.remove());
  });

  it('should open and close a popover', async () => {
    const { getByTestId } = await render(PopoverControlFlowRoot);
    const trigger = getByTestId('trigger');

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeNull();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeNull();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should open and close a tooltip', async () => {
    const { getByTestId } = await render(TooltipControlFlowRoot);
    const trigger = getByTestId('trigger');

    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeNull();
      expect(trigger).toHaveAttribute('data-open');
    });

    fireEvent.mouseLeave(trigger);
    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeNull();
      expect(trigger).not.toHaveAttribute('data-open');
    });
  });
});
