import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverPlacement, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

const OFFSET = 8;

@Component({
  template: `
    <div class="spacer"></div>
    <button
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerPlacement]="placement()"
      [ngpPopoverTriggerOffset]="offset"
    >
      Open Popover
    </button>
    <div class="spacer"></div>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  // The strategy comes from the panel's computed `position`; the docs examples use `fixed`.
  styles: `
    /* Enough page to scroll while keeping the trigger and panel inside the viewport. */
    .spacer {
      height: 600px;
    }

    [ngpPopover] {
      position: fixed;
      width: 120px;
      height: 60px;
    }
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class FixedPopoverTestComponent {
  readonly placement = signal<NgpPopoverPlacement>('bottom');
  readonly offset = OFFSET;
}

describe('overlay positioning', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
    window.scrollTo(0, 0);
  });

  describe('positioning strategy', () => {
    /** A `fixed` panel sits against the viewport, so `absolute` displaces it by the scroll. */
    async function expectAnchoredBelowTrigger(trigger: HTMLElement) {
      await waitFor(() => {
        const popover = document.querySelector('[ngpPopover]') as HTMLElement | null;
        expect(popover?.style.top).toBeTruthy();
        expect(popover!.getBoundingClientRect().top).toBeCloseTo(
          trigger.getBoundingClientRect().bottom + OFFSET,
          0,
        );
      });
    }

    it('should anchor a fixed overlay to its trigger on a scrolled page', async () => {
      const { getByRole } = await render(FixedPopoverTestComponent);
      window.scrollTo(0, 400);
      expect(window.scrollY).toBeGreaterThan(0);

      const trigger = getByRole('button');
      fireEvent.click(trigger);

      await expectAnchoredBelowTrigger(trigger);
    });

    it('should stay anchored when the position is updated', async () => {
      const { fixture, getByRole } = await render(FixedPopoverTestComponent);
      window.scrollTo(0, 400);

      const trigger = getByRole('button');
      fireEvent.click(trigger);
      await expectAnchoredBelowTrigger(trigger);

      // A placement change routes through `updatePosition()`, which lost the strategy.
      fixture.componentInstance.placement.set('top');
      fixture.detectChanges();

      await waitFor(() => {
        const popover = document.querySelector('[ngpPopover]') as HTMLElement;
        expect(popover.getBoundingClientRect().bottom).toBeCloseTo(
          trigger.getBoundingClientRect().top - OFFSET,
          0,
        );
      });
    });
  });
});
